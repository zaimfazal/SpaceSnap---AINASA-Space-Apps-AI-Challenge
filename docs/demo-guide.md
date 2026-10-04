# TerraVision AI — Live Demo & Presentation Guide

## NASA Space Apps Hackathon Presentation Walkthrough

### 1. Introduction (30 seconds)
- **Tagline**: *"See our planet differently. Understand it intelligently."*
- **Problem**: Satellites capture terabytes of breathtaking Earth imagery every day, but non-experts struggle to identify what features are visible, where they are located, and why they matter scientifically.
- **Solution**: TerraVision AI provides an end-to-end intelligence tool that takes any NASA satellite image, detects at least three distinct features, overlays synchronized spatial annotations, and produces plain-language grounded explanations.

### 2. Live Demo Script (2 minutes)
1. **The Core Journey**:
   - Open TerraVision AI (`http://localhost:5173`).
   - The workspace immediately loads Super Typhoon Surigae in the Western Pacific with 4 detected features: *Cyclone Eye*, *Eyewall Thunderstorms*, *Spiral Rainbands*, and *Deep Pelagic Ocean Surface*.
2. **Interactive Annotation & Viewer**:
   - Show how clicking the "Intense Eyewall" feature card automatically highlights the bounding box on the satellite image.
   - Switch viewing modes: Toggle between "Annotated", "Original", and "Side-by-Side Split" to show the interactive slider.
   - Zoom in on the eye of the storm using the canvas zoom controls.
3. **Simple-Language Scientific Explanation**:
   - Expand the right panel's "Simple Explanation" tab.
   - Highlight the 6 structured answers:
     * *What am I looking at?*
     * *What was detected?*
     * *What is happening?*
     * *Why does it matter?*
     * *How certain is the analysis?*
     * *What cannot be determined?*
4. **Live Multi-Spectral Computer Vision on Real Data**:
   - Click "Deforestation Grids in the Amazon Rainforest" or "California Wildfires".
   - Switch the engine mode to "Live Pixel CV".
   - Click "Analyze Satellite Image". The radar scanline sweeps over the image and resolves real-time contours in less than 300ms!
5. **NASA Image & Video Library Search**:
   - Switch to the "NASA Search" tab.
   - Type `"Earth from space"` or `"Arctic ice"`. Show live results streaming directly from `images-api.nasa.gov`.
   - Select a search result and run instant computer vision detection on it.
6. **Download & Export**:
   - Click "PNG" to export the annotated image.
   - Click "JSON" to export the machine-readable Pydantic analysis data.
7. **Local History**:
   - Navigate to "History" tab to show how every previous analysis is recorded in local browser storage.
