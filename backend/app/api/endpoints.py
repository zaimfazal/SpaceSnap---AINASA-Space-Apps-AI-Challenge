from typing import Optional, List
from datetime import datetime, timezone
import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Query
from app.schemas.analysis import (
    AnalysisResponse,
    AnalyzeURLRequest,
    SampleImage,
    NASAImageSearchResult,
    ModelStatus
)
from app.services.nasa_service import nasa_service
from app.services.analysis_service import analysis_service
from app.utils.security import fetch_image_from_url_safely, ALLOWED_MIME_TYPES
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cv_engine": "operational",
    }

@router.get("/images/samples", response_model=List[SampleImage])
def get_sample_images():
    """Returns curated NASA Earth & Space observation sample images."""
    return nasa_service.get_sample_images()

@router.get("/images/search", response_model=List[NASAImageSearchResult])
async def search_nasa_images(q: str = Query(..., min_length=2, description="Search query")):
    """Searches NASA's public Image and Video Library."""
    return await nasa_service.search_nasa_images(query=q)

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    sample_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    force_live_cv: bool = Form(False)
):
    """
    Analyzes an uploaded image, a public image URL, or a curated NASA sample.
    Runs computer vision feature detection and simple-language explanation generation.
    """
    image_bytes: bytes = b""
    image_title = title or "Earth Observation Image"
    custom_metadata = {}

    if file is not None:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{file.content_type}'. Please upload JPEG, PNG, or WEBP."
            )
        image_bytes = await file.read()
        max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if len(image_bytes) > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"Uploaded file exceeds {settings.MAX_IMAGE_SIZE_MB}MB size limit."
            )
        if not title:
            image_title = file.filename or "Uploaded Earth Image"
        custom_metadata = {
            "source": "User Upload",
            "filename": file.filename,
            "size_bytes": len(image_bytes)
        }

    elif sample_id:
        sample = nasa_service.get_sample_by_id(sample_id)
        if not sample:
            raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")
        image_title = sample.title
        image_bytes = await fetch_image_from_url_safely(sample.image_url)
        custom_metadata = sample.model_dump()

    elif image_url:
        image_bytes = await fetch_image_from_url_safely(image_url)
        custom_metadata = {
            "source": "Remote Public URL",
            "url": image_url
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide an uploaded image file, a public image URL, or a valid sample_id."
        )

    try:
        response = analysis_service.process_image(
            image_bytes=image_bytes,
            image_title=image_title,
            sample_id=sample_id,
            custom_metadata=custom_metadata,
            force_live_cv=force_live_cv
        )
        return response
    except Exception as e:
        logger.error(f"Error during image analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/analyze/json", response_model=AnalysisResponse)
async def analyze_image_json(request: AnalyzeURLRequest):
    """JSON variant endpoint for URL or sample_id analysis."""
    if not request.image_url and not request.sample_id:
        raise HTTPException(status_code=400, detail="Provide image_url or sample_id.")
    
    return await analyze_image(
        file=None,
        image_url=request.image_url,
        sample_id=request.sample_id,
        title=request.title,
        force_live_cv=False
    )

@router.get("/models/status", response_model=ModelStatus)
def get_model_status():
    """Returns the operational status of available vision and language models."""
    return ModelStatus(
        status="operational",
        active_engine="TerraVision Multi-Spectral CV & Ground-Truth Analysis System",
        cv_engine_available=True,
        multimodal_api_available=bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY),
        api_provider="Google Gemini" if settings.GEMINI_API_KEY else ("OpenAI" if settings.OPENAI_API_KEY else "Local Computer Vision Engine"),
        supported_categories=[
            "storms",
            "clouds",
            "oceans",
            "coastlines",
            "vegetation",
            "wildfires",
            "ice",
            "deserts",
            "urban",
            "rivers",
            "mountains",
            "volcanoes",
            "geology",
            "craters"
        ],
        version=settings.VERSION
    )
