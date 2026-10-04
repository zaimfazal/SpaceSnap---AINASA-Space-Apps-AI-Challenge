import ipaddress
import socket
from urllib.parse import urlparse
from fastapi import HTTPException
import httpx

ALLOWED_SCHEMES = {"http", "https"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
}

def is_ip_private_or_reserved(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True

def validate_public_url(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme or parsed.scheme.lower() not in ALLOWED_SCHEMES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid URL scheme '{parsed.scheme}'. Only http and https are permitted."
        )
    
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Missing hostname in image URL.")
    
    # Check for direct localhost / numeric loopbacks
    if hostname.lower() in {"localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"}:
        raise HTTPException(status_code=400, detail="Access to local or internal addresses is blocked for security.")
    
    # Resolve IP address to prevent DNS rebinding / SSRF
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for entry in addr_info:
            ip = entry[4][0]
            if is_ip_private_or_reserved(ip):
                raise HTTPException(
                    status_code=400,
                    detail=f"URL resolves to a restricted/private network address ({ip})."
                )
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"Could not resolve domain name: {hostname}")
    
    return url

async def fetch_image_from_url_safely(url: str, max_bytes: int = 25 * 1024 * 1024, timeout: int = 15) -> bytes:
    validate_public_url(url)
    
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        try:
            head_res = await client.head(url)
            content_length = head_res.headers.get("Content-Length")
            if content_length and int(content_length) > max_bytes:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image file exceeds maximum allowable size ({max_bytes // (1024*1024)}MB)."
                )
        except Exception:
            # Some servers don't support HEAD, fallback to GET with streaming size check
            pass
            
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout while fetching remote satellite image.")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch remote image: HTTP {e.response.status_code}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Network error downloading image: {str(e)}")
            
        data = response.content
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"Downloaded image ({len(data)} bytes) exceeded limit of {max_bytes} bytes."
            )
            
        content_type = response.headers.get("Content-Type", "").lower().split(";")[0].strip()
        # Verify content type or inspect first bytes
        if content_type and content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid content type '{content_type}'. Must be a valid JPEG, PNG, or WEBP image."
            )
            
        return data
