import { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Layers, 
  Eye, 
  EyeOff, 
  SplitSquareVertical, 
  Tag
} from 'lucide-react';
import type { AnalysisResponse, DetectedFeature } from '../../types';

interface InteractiveViewerProps {
  imageUrl: string;
  annotatedImageUrl?: string;
  analysis: AnalysisResponse | null;
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string | null) => void;
  isAnalyzing: boolean;
  imageTitle: string;
}

export const InteractiveViewer: React.FC<InteractiveViewerProps> = ({
  imageUrl,
  annotatedImageUrl,
  analysis,
  selectedFeatureId,
  onSelectFeature,
  isAnalyzing,
  imageTitle
}) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'original' | 'split'>('annotated');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState<DetectedFeature | null>(null);
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage for split view
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom & pan on new image
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectFeature(null);
  }, [imageUrl]);

  const handleZoomIn = () => setZoomLevel((prev: number) => Math.min(prev + 0.35, 4));
  const handleZoomOut = () => setZoomLevel((prev: number) => Math.max(prev - 0.35, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleCategoryVisibility = (cat: string) => {
    const updated = new Set(hiddenCategories);
    if (updated.has(cat)) {
      updated.delete(cat);
    } else {
      updated.add(cat);
    }
    setHiddenCategories(updated);
  };

  const downloadAnnotatedImage = () => {
    const source = annotatedImageUrl || imageUrl;
    const a = document.createElement('a');
    a.href = source;
    a.download = `terravision-${imageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-annotated.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAnalysisJSON = () => {
    if (!analysis) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `terravision-${imageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Extract distinct categories from analysis
  const uniqueCategories = analysis
    ? Array.from(new Set(analysis.features.map((f) => f.category)))
    : [];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('annotated')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'annotated'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Annotated</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'original'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Export Actions */}
          <button
            onClick={downloadAnnotatedImage}
            disabled={!imageUrl}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            title="Download Image"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          {analysis && (
            <button
              onClick={downloadAnalysisJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Download Structured Analysis JSON"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center select-none ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Radar scanline animation during analysis */}
        {isAnalyzing && <div className="scanline" />}

        {imageUrl ? (
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            {/* Split View Mode */}
            {viewMode === 'split' ? (
              <div className="relative inline-block overflow-hidden rounded-lg shadow-2xl">
                {/* Underneath: Original image */}
                <img
                  src={imageUrl}
                  alt="Original"
                  className="max-h-[68vh] w-auto object-contain block"
                />

                {/* Over top: Annotated image clipped by slider ratio */}
                <div
                  style={{ width: `${splitRatio}%` }}
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 shadow-xl"
                >
                  <img
                    src={annotatedImageUrl || imageUrl}
                    alt="Annotated"
                    className="max-h-[68vh] w-auto object-contain block max-w-none"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-mono text-cyan-300">
                    Annotated
                  </div>
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-slate-300">
                  Original
                </div>

                {/* Split slider control */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(Number(e.target.value))}
                  className="absolute inset-x-4 bottom-4 z-30 opacity-70 hover:opacity-100 accent-cyan-400 cursor-ew-resize"
                />
              </div>
            ) : (
              /* Single View Mode (Original or Annotated SVG Overlay) */
              <div className="relative inline-block rounded-lg overflow-hidden shadow-2xl">
                <img
                  ref={imageRef}
                  src={viewMode === 'original' ? imageUrl : (annotatedImageUrl || imageUrl)}
                  alt={imageTitle}
                  className="max-h-[68vh] w-auto object-contain block"
                />

                {/* Interactive SVG Overlay for Bounding Boxes & Polygons */}
                {viewMode === 'annotated' && analysis && analysis.features && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                  >
                    {analysis.features
                      .filter((f) => !hiddenCategories.has(f.category))
                      .map((feature) => {
                        const isSelected = selectedFeatureId === feature.id;
                        const isHovered = hoveredFeature?.id === feature.id;
                        const bx = feature.bbox.x * 1000;
                        const by = feature.bbox.y * 1000;
                        const bw = feature.bbox.width * 1000;
                        const bh = feature.bbox.height * 1000;

                        return (
                          <g
                            key={feature.id}
                            className="cursor-pointer transition-all duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFeature(isSelected ? null : feature.id);
                            }}
                            onMouseEnter={() => setHoveredFeature(feature)}
                            onMouseLeave={() => setHoveredFeature(null)}
                          >
                            {/* Polygon highlight if available */}
                            {feature.polygon && feature.polygon.length >= 3 ? (
                              <polygon
                                points={feature.polygon
                                  .map((p) => `${p.x * 1000},${p.y * 1000}`)
                                  .join(' ')}
                                fill={feature.color}
                                fillOpacity={isSelected || isHovered ? 0.35 : 0.15}
                                stroke={feature.color}
                                strokeWidth={isSelected || isHovered ? 4 : 2}
                                strokeDasharray={isSelected ? '6,3' : 'none'}
                              />
                            ) : (
                              /* Bounding box */
                              <rect
                                x={bx}
                                y={by}
                                width={bw}
                                height={bh}
                                fill={feature.color}
                                fillOpacity={isSelected || isHovered ? 0.30 : 0.12}
                                stroke={feature.color}
                                strokeWidth={isSelected || isHovered ? 4 : 2.5}
                                strokeDasharray={isSelected ? '6,3' : 'none'}
                                rx={4}
                              />
                            )}

                            {/* Label Banner */}
                            <g transform={`translate(${bx}, ${Math.max(24, by)})`}>
                              <rect
                                x={0}
                                y={-22}
                                width={Math.min(300, feature.name.length * 11 + 60)}
                                height={22}
                                fill={feature.color}
                                rx={3}
                              />
                              <text
                                x={6}
                                y={-6}
                                fill="#ffffff"
                                fontSize="12"
                                fontWeight="600"
                                fontFamily="sans-serif"
                              >
                                {feature.name} {feature.confidence ? `(${Math.round(feature.confidence * 100)}%)` : ''}
                              </text>
                            </g>
                          </g>
                        );
                      })}
                  </svg>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <p className="text-sm">No satellite image loaded</p>
            <p className="text-xs text-slate-600 mt-1">Select a sample or upload an image to begin.</p>
          </div>
        )}

        {/* Hover Tooltip Card */}
        {hoveredFeature && (
          <div className="absolute bottom-4 left-4 z-40 max-w-sm p-3 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-xl shadow-cyan-950/50 backdrop-blur-md pointer-events-none transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hoveredFeature.color }}
              />
              <span className="text-xs font-semibold text-white">
                {hoveredFeature.name}
              </span>
              {hoveredFeature.confidence && (
                <span className="text-[10px] font-mono text-cyan-300 ml-auto">
                  {Math.round(hoveredFeature.confidence * 100)}% match
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              {hoveredFeature.description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Category Filter Legend */}
      {analysis && uniqueCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Layers:</span>
          {uniqueCategories.map((cat) => {
            const isHidden = hiddenCategories.has(cat);
            const sampleFeat = analysis.features.find((f) => f.category === cat);
            const catColor = sampleFeat?.color || '#06b6d4';

            return (
              <button
                key={cat}
                onClick={() => toggleCategoryVisibility(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                  isHidden
                    ? 'bg-slate-950/60 border-slate-800 text-slate-500 line-through'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-cyan-500/40'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isHidden ? '#64748b' : catColor }}
                />
                <span className="capitalize">{cat}</span>
                {isHidden ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
