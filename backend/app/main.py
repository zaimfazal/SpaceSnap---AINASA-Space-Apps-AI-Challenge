import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terravision")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TerraVision AI — Explore Earth Through Intelligence. Computer vision and AI analysis of NASA satellite imagery."
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": "See our planet differently. Understand it intelligently.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
