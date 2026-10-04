import logging
from typing import List, Dict, Any, Optional
from app.schemas.analysis import DetectedFeature, SimpleExplanation
from app.core.config import settings

logger = logging.getLogger(__name__)

class TerraVisionExplainer:
    """
    Generates grounded, simple-language scientific explanations for detected Earth features.
    Adheres strictly to scientific restraint and avoids speculative causal claims.
    """

    def generate_explanation(
        self,
        image_title: str,
        features: List[DetectedFeature],
        stats: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> SimpleExplanation:
        feature_names = [f.name for f in features]
        categories = list({f.category for f in features})
        
        # 1. What am I looking at?
        cat_summaries = []
        if "storms" in categories or "clouds" in categories:
            cat_summaries.append("extensive atmospheric cloud systems")
        if "oceans" in categories:
            cat_summaries.append("deep marine water bodies")
        if "vegetation" in categories:
            cat_summaries.append("photosynthetic vegetative canopy")
        if "ice" in categories:
            cat_summaries.append("cryospheric ice sheets and glacial formations")
        if "wildfires" in categories:
            cat_summaries.append("atmospheric aerosol plumes and haze")
        if "deserts" in categories:
            cat_summaries.append("arid geological terrain and sand dunes")
        if "urban" in categories:
            cat_summaries.append("anthropogenic infrastructure and built-up land patterns")
        if "geology" in categories or "craters" in categories:
            cat_summaries.append("concentric topographic and geological structures")
            
        scene_summary = ", ".join(cat_summaries) if cat_summaries else "various optical surface and atmospheric features"
        loc_str = f" over {metadata.get('location')}" if metadata and metadata.get("location") else ""
        what_am_i_looking_at = (
            f"This satellite observation displays {scene_summary}{loc_str}. "
            f"The image captures optical radiance and color contrasts reflecting how light from the Sun interacts "
            f"with Earth's atmosphere, landforms, or water surfaces."
        )

        # 2. What was detected?
        what_was_detected = [
            f"{f.name} ({f.category.capitalize()}): covers approx {f.area_percentage or 'N/A'}% of the frame"
            for f in features
        ]

        # 3. What is happening?
        relationships = []
        if "storms" in categories or "clouds" in categories:
            relationships.append(
                "Dense convective cloud masses are circulating above the surface, reflecting high amounts of solar radiation back into space."
            )
        if "oceans" in categories and "clouds" in categories:
            relationships.append(
                "Distinct boundaries are visible between open marine waters (which absorb most sunlight and appear dark) and overlying moisture."
            )
        if "vegetation" in categories and "urban" in categories:
            relationships.append(
                "Sharp boundaries demarcate dense chlorophyll-rich green vegetation from rectilinear urban infrastructure grids."
            )
        if "vegetation" in categories and "wildfires" in categories:
            relationships.append(
                "A semi-opaque aerosol plume extends across the forest canopy, obscuring fine ground surface details beneath it."
            )
        if "ice" in categories and "oceans" in categories:
            relationships.append(
                "Highly reflective ice structures border open ocean waters, revealing fracture lines and dynamic sea ice margins."
            )
        if "geology" in categories:
            relationships.append(
                "Differential erosion has exposed concentric rings of varying rock hardness, creating visible topographic relief."
            )
        if not relationships:
            relationships.append(
                "Multiple surface spectral zones interface across the landscape, delineating natural terrain and land-cover transitions."
            )
        what_is_happening = " ".join(relationships)

        # 4. Why does it matter?
        reasons = []
        if "storms" in categories or "clouds" in categories:
            reasons.append(
                "Tracking cloud formations helps atmospheric scientists monitor weather systems, moisture transport, and Earth's radiative energy balance."
            )
        if "vegetation" in categories:
            reasons.append(
                "Observing canopy density from space is vital for tracking ecosystem health, carbon sequestration, and human land-use changes."
            )
        if "ice" in categories:
            reasons.append(
                "Cryosphere monitoring tracks ice-sheet stability, glacier retreat, and polar climate responses affecting global sea level."
            )
        if "oceans" in categories:
            reasons.append(
                "Ocean surface observations document phytoplankton blooms, circulation gyres, and coastal sedimentation."
            )
        if "wildfires" in categories:
            reasons.append(
                "Detecting smoke plumes assists in air quality alerts, aerosol dispersion modeling, and environmental hazard response."
            )
        if not reasons:
            reasons.append(
                "Consistent Earth observation provides continuous baseline data to understand natural geological and environmental processes."
            )
        why_does_it_matter = " ".join(reasons)

        # 5. How certain is the analysis?
        avg_conf = (
            sum(f.confidence for f in features if f.confidence is not None) / max(1, len([f for f in features if f.confidence is not None]))
        )
        conf_pct = int(avg_conf * 100)
        how_certain_is_analysis = (
            f"The optical feature boundaries show an estimated confidence of approximately {conf_pct}%, grounded in multi-spectral "
            f"reflectance and gradient segmentation. Cloud cover, atmospheric scattering, and sensor sun angle introduce moderate margin for variance."
        )

        # 6. What cannot be determined?
        what_cannot_be_determined = [
            "Exact wind speeds, barometric pressure, or storm category cannot be measured from visible-spectrum imagery alone without scatterometer or radar data.",
            "Subsurface geology, water depth, or soil moisture cannot be directly inferred without specialized microwave or bathymetric sensors.",
            "Live fire intensity or active flame fronts require calibrated thermal infrared bands (such as MODIS/VIIRS 4μm channels) rather than true-color optical bands.",
            "Long-term climate trajectories or causal environmental trends cannot be determined from a single isolated snapshot."
        ]

        return SimpleExplanation(
            what_am_i_looking_at=what_am_i_looking_at,
            what_was_detected=what_was_detected,
            what_is_happening=what_is_happening,
            why_does_it_matter=why_does_it_matter,
            how_certain_is_analysis=how_certain_is_analysis,
            what_cannot_be_determined=what_cannot_be_determined
        )

explainer = TerraVisionExplainer()
