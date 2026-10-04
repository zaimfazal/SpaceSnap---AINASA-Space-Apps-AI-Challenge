import json
import logging
from typing import List, Optional
import httpx
from app.core.config import settings
from app.schemas.analysis import SampleImage, NASAImageSearchResult

logger = logging.getLogger(__name__)

class NASAService:
    def __init__(self):
        self._samples_cache: Optional[List[SampleImage]] = None

    def get_sample_images(self) -> List[SampleImage]:
        if self._samples_cache is not None:
            return self._samples_cache
        
        metadata_path = settings.SAMPLE_METADATA_PATH
        if not metadata_path.exists():
            logger.warning(f"Sample metadata file not found at {metadata_path}")
            return []
            
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._samples_cache = [SampleImage(**item) for item in data]
                return self._samples_cache
        except Exception as e:
            logger.error(f"Failed to read sample metadata: {e}")
            return []

    def get_sample_by_id(self, sample_id: str) -> Optional[SampleImage]:
        samples = self.get_sample_images()
        for s in samples:
            if s.id == sample_id:
                return s
        return None

    async def search_nasa_images(self, query: str, limit: int = 15) -> List[NASAImageSearchResult]:
        if not query or not query.strip():
            return []

        search_url = "https://images-api.nasa.gov/search"
        params = {
            "q": query.strip(),
            "media_type": "image",
            "page": "1"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(search_url, params=params)
                response.raise_for_status()
                data = response.json()
            except httpx.TimeoutException:
                logger.error("NASA API request timed out")
                return []
            except Exception as e:
                logger.error(f"Error querying NASA API: {e}")
                return []

        items = data.get("collection", {}).get("items", [])
        results: List[NASAImageSearchResult] = []

        for item in items[:limit]:
            item_data = item.get("data", [{}])[0]
            nasa_id = item_data.get("nasa_id", "")
            title = item_data.get("title", "Untitled NASA Image")
            description = item_data.get("description", "")
            date_created = item_data.get("date_created", "")
            center = item_data.get("center", "NASA")
            keywords = item_data.get("keywords", [])

            links = item.get("links", [])
            thumbnail_url = ""
            for link in links:
                if link.get("rel") == "preview":
                    thumbnail_url = link.get("href", "")
                    break

            if not thumbnail_url and links:
                thumbnail_url = links[0].get("href", "")

            # If thumbnail is available, construct likely medium/orig URL or use thumbnail
            # NASA images usually provide thumb/preview. We can use preview for analysis
            image_url = thumbnail_url
            if "~thumb." in thumbnail_url:
                image_url = thumbnail_url.replace("~thumb.", "~medium.")

            if thumbnail_url:
                results.append(NASAImageSearchResult(
                    nasa_id=nasa_id,
                    title=title,
                    description=description[:300] + ("..." if len(description) > 300 else ""),
                    date_created=date_created.split("T")[0] if "T" in date_created else date_created,
                    center=center,
                    thumbnail_url=thumbnail_url,
                    image_url=image_url,
                    keywords=keywords[:5] if isinstance(keywords, list) else []
                ))

        return results

nasa_service = NASAService()
