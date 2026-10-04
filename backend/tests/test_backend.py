import io
import numpy as np
import cv2
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision_engine import vision_engine
from app.services.nasa_service import nasa_service

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "cv_engine" in data

def test_get_samples():
    res = client.get("/api/images/samples")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 6
    sample = samples[0]
    assert "id" in sample
    assert "title" in sample
    assert "source_url" in sample
    assert "image_url" in sample

def test_model_status():
    res = client.get("/api/models/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["cv_engine_available"] is True
    assert len(data["supported_categories"]) >= 10

def test_live_cv_analysis_on_synthetic_scene():
    # Create a synthetic 300x300 image containing 3 distinct Earth feature regions:
    # 1. Dark ocean water (bottom half)
    # 2. Bright white cloud cluster (top left)
    # 3. Chlorophyll green land / vegetation (top right)
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    
    # Ocean: Deep navy blue
    img[150:, :] = [20, 45, 110]
    
    # Vegetation: Chlorophyll green (high green, lower red/blue)
    img[:150, 150:] = [35, 140, 40]
    
    # Clouds: Bright white
    cv2.circle(img, (75, 75), 45, (245, 245, 250), -1)
    
    # Convert to JPEG bytes
    success, buffer = cv2.imencode(".jpg", img)
    assert success
    img_bytes = buffer.tobytes()
    
    # Send to analyze endpoint
    files = {"file": ("test_satellite_scene.jpg", img_bytes, "image/jpeg")}
    data = {"title": "Synthetic Earth Test Scene", "force_live_cv": "true"}
    res = client.post("/api/analyze", files=files, data=data)
    
    assert res.status_code == 200
    result = res.json()
    assert result["analysis_status"] == "success"
    assert result["analysis_mode"] == "live_cv_inference"
    assert len(result["features"]) >= 3
    
    # Verify bounding boxes are between 0 and 1
    for f in result["features"]:
        bbox = f["bbox"]
        assert 0.0 <= bbox["x"] <= 1.0
        assert 0.0 <= bbox["y"] <= 1.0
        assert 0.0 < bbox["width"] <= 1.0
        assert 0.0 < bbox["height"] <= 1.0
        assert "evidence_type" in f
        
    # Verify explanation schema
    exp = result["explanation"]
    assert len(exp["what_am_i_looking_at"]) > 20
    assert len(exp["what_was_detected"]) >= 3
    assert len(exp["what_is_happening"]) > 10
    assert len(exp["why_does_it_matter"]) > 10
    assert len(exp["how_certain_is_analysis"]) > 10
    assert len(exp["what_cannot_be_determined"]) >= 2
    
    # Verify annotated image base64 is generated
    assert result["annotated_image_base64"] is not None
    assert result["annotated_image_base64"].startswith("data:image/jpeg;base64,")
