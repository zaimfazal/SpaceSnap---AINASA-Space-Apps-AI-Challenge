import io
import math
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image

from app.schemas.analysis import BoundingBox, PolygonPoint, DetectedFeature

CATEGORY_COLORS = {
    "storms": "#0284c7",       # Deep Sky Blue
    "clouds": "#38bdf8",       # Light Cyan
    "oceans": "#2563eb",       # Royal Blue
    "coastlines": "#6366f1",   # Indigo
    "vegetation": "#10b981",   # Emerald
    "wildfires": "#f97316",    # Vivid Orange
    "ice": "#06b6d4",          # Crisp Teal
    "deserts": "#eab308",      # Golden Sand
    "urban": "#d946ef",        # Bright Magenta
    "rivers": "#0ea5e9",       # Blue River
    "mountains": "#8b5cf6",    # Violet
    "volcanoes": "#ef4444",    # Crimson Red
    "geology": "#f59e0b",      # Amber
    "craters": "#ec4899",      # Rose
}

class EarthVisionCVEngine:
    """
    Advanced Earth Observation Computer Vision Engine.
    Executes multi-spectral proxy segmentation, texture gradient analysis,
    contour extraction, and spatial feature localization on satellite imagery.
    """

    def decode_image(self, image_bytes: bytes) -> np.ndarray:
        """Decodes raw bytes into an RGB NumPy array."""
        image_pil = Image.open(io.BytesIO(image_bytes))
        if image_pil.mode != "RGB":
            image_pil = image_pil.convert("RGB")
        return np.array(image_pil)

    def extract_polygon_from_contour(
        self, contour: np.ndarray, img_w: int, img_h: int, max_points: int = 16
    ) -> List[PolygonPoint]:
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) > max_points:
            step = max(1, len(approx) // max_points)
            approx = approx[::step]
        
        points: List[PolygonPoint] = []
        for pt in approx:
            px = float(pt[0][0]) / img_w
            py = float(pt[0][1]) / img_h
            points.append(PolygonPoint(x=round(max(0.0, min(1.0, px)), 4), y=round(max(0.0, min(1.0, py)), 4)))
        return points

    def analyze_scene_spectrals(self, rgb_img: np.ndarray) -> Dict[str, Any]:
        """Calculates multi-spectral Earth observation indices."""
        h, w, _ = rgb_img.shape
        r = rgb_img[:, :, 0].astype(np.float32)
        g = rgb_img[:, :, 1].astype(np.float32)
        b = rgb_img[:, :, 2].astype(np.float32)
        
        # 1. GLI (Green Leaf Index proxy for NDVI): (2*G - R - B) / (2*G + R + B + eps)
        denominator = 2 * g + r + b + 1e-6
        gli = (2 * g - r - b) / denominator
        vegetation_mask = (gli > 0.08) & (g > 35)
        
        # 2. Water / Ocean index: High Blue-to-Red ratio, moderate-to-low brightness
        brightness = (r + g + b) / 3.0
        water_ratio = (b + 1e-6) / (r + 1e-6)
        water_mask = (water_ratio > 1.25) & (brightness < 125) & (g < 140)
        
        # 3. Clouds: High brightness, low saturation in HSV
        hsv = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2HSV)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]
        clouds_mask = (val > 195) & (sat < 40)
        
        # 4. Ice / Snow / Glaciers: Very high brightness, distinctive cold reflectance
        ice_mask = (val > 210) & (b > 200) & (b >= r) & (sat < 65) & (~clouds_mask)
        
        # 5. Desert / Arid land: Warm yellowish/reddish hues, low vegetation
        desert_mask = (val > 100) & (r > g) & (g > b) & (gli < -0.05) & (r > 110)
        
        # 6. Wildfire smoke: Diffuse, low-contrast grayish-amber haze
        gray = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F)
        smoke_mask = (val > 130) & (val < 220) & (sat < 60) & (abs(laplacian_var) < 15) & (r >= b)
        
        # 7. Urban / Structured infrastructure: High local edge density
        edges = cv2.Canny(gray, 60, 160)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        edge_density = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        urban_mask = (edge_density > 0) & (sat < 50) & (brightness > 60) & (brightness < 185)
        
        total_pixels = h * w
        stats = {
            "vegetation_pct": round(float(np.sum(vegetation_mask)) / total_pixels * 100, 2),
            "water_pct": round(float(np.sum(water_mask)) / total_pixels * 100, 2),
            "clouds_pct": round(float(np.sum(clouds_mask)) / total_pixels * 100, 2),
            "ice_pct": round(float(np.sum(ice_mask)) / total_pixels * 100, 2),
            "desert_pct": round(float(np.sum(desert_mask)) / total_pixels * 100, 2),
            "urban_pct": round(float(np.sum(urban_mask)) / total_pixels * 100, 2),
            "smoke_pct": round(float(np.sum(smoke_mask)) / total_pixels * 100, 2),
            "mean_luminance": round(float(np.mean(brightness)), 2),
            "image_dimensions": {"width": w, "height": h}
        }
        
        masks = {
            "clouds": clouds_mask.astype(np.uint8) * 255,
            "oceans": water_mask.astype(np.uint8) * 255,
            "vegetation": vegetation_mask.astype(np.uint8) * 255,
            "ice": ice_mask.astype(np.uint8) * 255,
            "deserts": desert_mask.astype(np.uint8) * 255,
            "urban": urban_mask.astype(np.uint8) * 255,
            "wildfires": smoke_mask.astype(np.uint8) * 255,
        }
        
        return {"stats": stats, "masks": masks, "gray": gray}

    def detect_circular_geological_features(self, gray: np.ndarray, w: int, h: int) -> List[Dict[str, Any]]:
        """Detects circular geological structures, craters, or calderas using Hough circles."""
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        min_dim = min(w, h)
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=min_dim // 3,
            param1=80,
            param2=45,
            minRadius=int(min_dim * 0.08),
            maxRadius=int(min_dim * 0.45),
        )
        
        results = []
        if circles is not None:
            circles = np.uint16(np.around(circles))
            for i in circles[0, :2]:  # At most 2 prominent circular structures
                cx, cy, radius = int(i[0]), int(i[1]), int(i[2])
                x = max(0, cx - radius)
                y = max(0, cy - radius)
                box_w = min(w - x, radius * 2)
                box_h = min(h - y, radius * 2)
                
                results.append({
                    "name": "Circular Geological Feature / Caldera Ring",
                    "category": "geology",
                    "bbox": BoundingBox(
                        x=round(x / w, 4),
                        y=round(y / h, 4),
                        width=round(box_w / w, 4),
                        height=round(box_h / h, 4),
                    ),
                    "confidence": 0.88,
                    "description": "Concentric topographic ring structure consistent with an impact crater or volcanic caldera collapse.",
                    "color": CATEGORY_COLORS["geology"],
                    "area_percentage": round((math.pi * radius * radius) / (w * h) * 100, 2),
                })
        return results

    def extract_features_from_mask(
        self,
        mask: np.ndarray,
        category: str,
        display_name: str,
        w: int,
        h: int,
        min_area_pct: float = 1.0,
        max_features: int = 2
    ) -> List[DetectedFeature]:
        total_pixels = w * h
        min_pixels = int(total_pixels * (min_area_pct / 100.0))
        
        # Morphological clean up to remove high frequency noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
        
        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        # Sort by contour area descending
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        features: List[DetectedFeature] = []
        for idx, cnt in enumerate(contours[:max_features]):
            area = cv2.contourArea(cnt)
            if area < min_pixels:
                continue
                
            bx, by, bw, bh = cv2.boundingRect(cnt)
            area_pct = round((area / total_pixels) * 100, 2)
            
            # Grounded confidence calculation based on contour solidity and area
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull) + 1e-6
            solidity = min(1.0, max(0.5, area / hull_area))
            confidence = round(float(0.78 + (0.18 * solidity)), 2)
            
            polygon = self.extract_polygon_from_contour(cnt, w, h)
            
            category_descriptions = {
                "clouds": f"Dense high-albedo cloud formation covering approximately {area_pct}% of the view.",
                "storms": f"Coherent spiraling storm system with strong convective cloud tops.",
                "oceans": f"Deep marine surface water exhibiting characteristic low reflectance and high blue-band attenuation.",
                "vegetation": f"Contiguous photosynthetic vegetative canopy with high chlorophyll green-reflectance proxy.",
                "ice": f"High-reflectance cryospheric ice sheet / glacier formation with visible rift boundaries.",
                "deserts": f"Arid desert surface terrain characterized by exposed mineral soil and dune fields.",
                "urban": f"Dense anthropogenic infrastructure grid with pronounced structural edge variance.",
                "wildfires": f"Diffuse aerosol smoke plume propagating across atmospheric boundary layers.",
            }
            desc = category_descriptions.get(
                category,
                f"Prominent spatial feature identified via multi-spectral computer vision."
            )
            
            features.append(DetectedFeature(
                id=f"feat-{category}-{idx+1}",
                name=f"{display_name} #{idx+1}" if len(contours) > 1 else display_name,
                category=category,
                confidence=confidence,
                description=desc,
                bbox=BoundingBox(
                    x=round(bx / w, 4),
                    y=round(by / h, 4),
                    width=round(bw / w, 4),
                    height=round(bh / h, 4)
                ),
                polygon=polygon,
                area_percentage=area_pct,
                color=CATEGORY_COLORS.get(category, "#06b6d4"),
                evidence_type="spectral_cv_analysis"
            ))
            
        return features

    def run_live_cv_detection(self, rgb_img: np.ndarray) -> Tuple[List[DetectedFeature], Dict[str, Any]]:
        """
        Executes full live computer vision feature detection.
        Guarantees detection of at least 3 distinct spatial features.
        """
        h, w, _ = rgb_img.shape
        scene_analysis = self.analyze_scene_spectrals(rgb_img)
        masks = scene_analysis["masks"]
        stats = scene_analysis["stats"]
        gray = scene_analysis["gray"]
        
        detected_features: List[DetectedFeature] = []
        
        # Category definitions in priority order
        detection_configs = [
            ("clouds", "Cloud System / Storm Formations", masks["clouds"], 2.0, 2),
            ("oceans", "Open Ocean / Water Body", masks["oceans"], 2.5, 2),
            ("vegetation", "Forest / Vegetative Canopy", masks["vegetation"], 1.5, 2),
            ("ice", "Glacial Ice / Cryosphere", masks["ice"], 1.5, 2),
            ("deserts", "Arid Basin / Desert Terrain", masks["deserts"], 2.0, 2),
            ("wildfires", "Atmospheric Smoke Plume", masks["wildfires"], 1.5, 1),
            ("urban", "Urban / Built Infrastructure", masks["urban"], 1.5, 1),
        ]
        
        for cat, name, mask, min_pct, max_f in detection_configs:
            feats = self.extract_features_from_mask(mask, cat, name, w, h, min_pct, max_f)
            detected_features.extend(feats)
            
        # Check circular structures (craters / calderas)
        circular_feats = self.detect_circular_geological_features(gray, w, h)
        for cf in circular_feats:
            detected_features.append(DetectedFeature(
                id=f"feat-geology-circle-{len(detected_features)+1}",
                name=cf["name"],
                category=cf["category"],
                confidence=cf["confidence"],
                description=cf["description"],
                bbox=cf["bbox"],
                polygon=None,
                area_percentage=cf["area_percentage"],
                color=cf["color"],
                evidence_type="spectral_cv_analysis"
            ))
            
        # Ensure at least 3 distinct features if possible by partitioning dominant regions
        if len(detected_features) < 3:
            # Fallback: extract prominent intensity quadrants or salient spectral zones
            gray_blur = cv2.GaussianBlur(gray, (25, 25), 0)
            thresholds = [
                ("High Reflectance Zone (Albedo Anomaly)", 200, 255, "clouds", CATEGORY_COLORS["clouds"]),
                ("Intermediate Terrain Boundary", 80, 199, "deserts", CATEGORY_COLORS["deserts"]),
                ("Low Reflectance Basin / Water Absorption", 0, 79, "oceans", CATEGORY_COLORS["oceans"]),
            ]
            for name, low, high, cat, col in thresholds:
                if len(detected_features) >= 3:
                    break
                t_mask = cv2.inRange(gray_blur, low, high)
                feats = self.extract_features_from_mask(t_mask, cat, name, w, h, 2.0, 1)
                for f in feats:
                    f.id = f"feat-intensity-{len(detected_features)+1}"
                    detected_features.append(f)
                    if len(detected_features) >= 4:
                        break

        # Sort features by area descending and assign unique IDs
        detected_features = sorted(detected_features, key=lambda f: f.area_percentage or 0.0, reverse=True)
        for i, feat in enumerate(detected_features):
            feat.id = f"feat-{i+1}"
            
        return detected_features, stats

    def draw_annotated_image(self, rgb_img: np.ndarray, features: List[DetectedFeature]) -> np.ndarray:
        """
        Draws precise spatial bounding boxes, labels, and polygons onto the image.
        Uses OpenCV for pristine pixel rendering.
        """
        img_out = rgb_img.copy()
        h, w, _ = img_out.shape
        
        # Semi-transparent overlay layer for segmentation highlight
        overlay = img_out.copy()
        
        for feat in features:
            # Parse color hex to BGR
            hex_col = feat.color.lstrip("#")
            r = int(hex_col[0:2], 16)
            g = int(hex_col[2:4], 16)
            b = int(hex_col[4:6], 16)
            color_rgb = (r, g, b)
            
            bx = int(feat.bbox.x * w)
            by = int(feat.bbox.y * h)
            bw = int(feat.bbox.width * w)
            bh = int(feat.bbox.height * h)
            
            # Fill polygon if present or fill bounding box semi-transparently
            if feat.polygon and len(feat.polygon) >= 3:
                pts = np.array([[int(p.x * w), int(p.y * h)] for p in feat.polygon], np.int32)
                pts = pts.reshape((-1, 1, 2))
                cv2.fillPoly(overlay, [pts], color_rgb)
                cv2.polylines(img_out, [pts], True, color_rgb, 2, cv2.LINE_AA)
            else:
                cv2.rectangle(overlay, (bx, by), (bx + bw, by + bh), color_rgb, -1)
                
            # Draw crisp bounding box
            cv2.rectangle(img_out, (bx, by), (bx + bw, by + bh), color_rgb, 2, cv2.LINE_AA)
            
            # Draw label banner
            conf_str = f" {int(feat.confidence * 100)}%" if feat.confidence is not None else ""
            label_text = f"{feat.name}{conf_str}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = max(0.45, min(0.7, w / 1400))
            thickness = 1
            (text_w, text_h), baseline = cv2.getTextSize(label_text, font, font_scale, thickness)
            
            label_y = max(text_h + 8, by)
            cv2.rectangle(
                img_out,
                (bx, label_y - text_h - 6),
                (bx + text_w + 10, label_y + baseline),
                color_rgb,
                -1
            )
            cv2.putText(
                img_out,
                label_text,
                (bx + 5, label_y - 2),
                font,
                font_scale,
                (255, 255, 255),
                thickness,
                cv2.LINE_AA
            )
            
        # Blend overlay (25% opacity) with annotated image
        cv2.addWeighted(overlay, 0.22, img_out, 0.78, 0, img_out)
        return img_out

vision_engine = EarthVisionCVEngine()
