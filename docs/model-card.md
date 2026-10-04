# TerraVision AI — Model Card

## Model Overview
- **Model Name**: EarthVision Multi-Spectral Proxy & Contour Engine (`EarthVisionCV`)
- **Model Type**: Hybrid Multi-Spectral Computer Vision & Morphological Segmentation Pipeline
- **Version**: 1.0.0
- **Maintainer**: TerraVision AI Engineering Team

## Intended Use
- **Primary Domain**: Satellite Earth observation, orbital imagery analysis, and accessible scientific education.
- **Target Audience**: Researchers, students, hackathon participants, and general public seeking to understand planetary observation data.

## Technical Details

### Input Specifications
- **Format**: True-color or false-color RGB imagery (JPEG, PNG, WEBP).
- **Resolution**: Up to 4096 x 4096 px (preprocessed internally).
- **Channels**: 3-channel 8-bit unsigned integer arrays.

### Segmentation & Extraction Heuristics
1. **Vegetative Chlorophyll Proxy**: Green Leaf Index:
   $$GLI = \frac{2G - R - B}{2G + R + B + \epsilon}$$
   Thresholded at $GLI > 0.08$ with morphological opening.
2. **Pelagic Water Attenuation**: High Blue-to-Red radiance attenuation ratio combined with low mean scene luminance.
3. **Atmospheric Convective Cells & High Albedo**: HSV luminance saturation analysis isolating cloud tops ($V > 195, S < 40$) and cryospheric ice sheets ($B > 200, B \ge R$).
4. **Anthropogenic Infrastructure & Road Grids**: Canny edge detection ($T_{low}=60, T_{high}=160$) followed by close morphological kernels ($15 \times 15$) measuring localized edge density.
5. **Impact Craters & Caldera Structures**: Circular Hough gradient transforms with radius parameters normalized to image scale.

### Output Schema
- **Bounding Boxes**: Normalized `[x, y, width, height]` in range `[0.0, 1.0]`.
- **Polygon Points**: Approximated Douglas-Peucker contour vertices for true segmentation overlays.
- **Confidence Calibration**: Computed from contour solidity $\frac{Area}{HullArea}$ and radiometric variance.

## Known Limitations & Ethical Restraints
- **Atmospheric Interference**: Cloud cover, volcanic aerosol, and high-altitude cirrus can obscure ground surface features.
- **Sensor Band Limitations**: Standard RGB optical photography lacks true multispectral thermal infrared (TIR) and shortwave infrared (SWIR) bands. Subsurface properties, water depth, and soil moisture cannot be directly validated from appearance alone.
- **Non-Causal**: Does not forecast storm landfall coordinates or wildfire propagation trajectories without dedicated atmospheric dynamic modeling.
