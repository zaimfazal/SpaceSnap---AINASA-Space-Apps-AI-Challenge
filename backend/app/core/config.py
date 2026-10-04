import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraVision AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR.parent / "data"
    SAMPLES_DIR: Path = DATA_DIR / "samples"
    SAMPLE_METADATA_PATH: Path = SAMPLES_DIR / "sample_metadata.json"
    
    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Security & limits
    MAX_IMAGE_SIZE_MB: int = 20
    MAX_IMAGE_DIMENSION: int = 4096
    REQUEST_TIMEOUT_SECONDS: int = 15
    MAX_URL_DOWNLOAD_BYTES: int = 25 * 1024 * 1024  # 25 MB
    
    # Model & API keys
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    
    # Execution mode: "auto", "cv_engine", "multimodal", "demo"
    ANALYSIS_MODE: str = os.getenv("TERRAVISION_ANALYSIS_MODE", "auto")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
