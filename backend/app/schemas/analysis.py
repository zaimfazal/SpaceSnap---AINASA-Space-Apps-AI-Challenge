from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: float = Field(..., ge=0.0, le=1.0, description="Normalized top-left X coordinate (0.0 to 1.0)")
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized top-left Y coordinate (0.0 to 1.0)")
    width: float = Field(..., ge=0.0, le=1.0, description="Normalized width (0.0 to 1.0)")
    height: float = Field(..., ge=0.0, le=1.0, description="Normalized height (0.0 to 1.0)")

class PolygonPoint(BaseModel):
    x: float = Field(..., ge=0.0, le=1.0)
    y: float = Field(..., ge=0.0, le=1.0)

class DetectedFeature(BaseModel):
    id: str
    name: str
    category: str
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    description: str
    bbox: BoundingBox
    polygon: Optional[List[PolygonPoint]] = None
    area_percentage: Optional[float] = None
    color: str = "#06b6d4"  # Default cyan
    evidence_type: str = "spectral_cv_analysis"

class SimpleExplanation(BaseModel):
    what_am_i_looking_at: str
    what_was_detected: List[str]
    what_is_happening: str
    why_does_it_matter: str
    how_certain_is_analysis: str
    what_cannot_be_determined: List[str]

class AnalysisResponse(BaseModel):
    image_title: str
    analysis_status: str
    analysis_mode: str  # "live_cv_inference", "multimodal_api", "curated_ground_truth"
    model_used: str
    is_demo_analysis: bool = False
    features: List[DetectedFeature]
    summary: str
    observations: List[str]
    limitations: List[str]
    explanation: SimpleExplanation
    image_metadata: Dict[str, Any] = Field(default_factory=dict)
    processing_time_ms: float = 0.0
    annotated_image_base64: Optional[str] = None

class AnalyzeURLRequest(BaseModel):
    image_url: Optional[str] = None
    sample_id: Optional[str] = None
    title: Optional[str] = None

class SampleImage(BaseModel):
    id: str
    title: str
    category: str
    location: Optional[str] = None
    coordinates: Optional[str] = None
    capture_date: Optional[str] = None
    source: str
    mission: Optional[str] = None
    source_url: str
    image_url: str
    thumbnail_url: str
    resolution: Optional[str] = None
    description: str
    verified: bool = True
    key_features: List[str] = Field(default_factory=list)

class NASAImageSearchResult(BaseModel):
    nasa_id: str
    title: str
    description: Optional[str] = None
    date_created: Optional[str] = None
    center: Optional[str] = None
    thumbnail_url: str
    image_url: str
    keywords: List[str] = Field(default_factory=list)

class ModelStatus(BaseModel):
    status: str
    active_engine: str
    cv_engine_available: bool
    multimodal_api_available: bool
    api_provider: Optional[str] = None
    supported_categories: List[str]
    version: str
