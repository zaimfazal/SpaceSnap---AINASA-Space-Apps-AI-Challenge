import { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Compass,
  ShieldAlert,
  Percent
} from 'lucide-react';
import type { AnalysisResponse } from '../../types';

interface InsightsPanelProps {
  analysis: AnalysisResponse | null;
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string | null) => void;
  isAnalyzing: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  analysis,
  selectedFeatureId,
  onSelectFeature,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'explanation'>('features');
  const [expandedSection, setExpandedSection] = useState<string | null>('looking_at');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 items-center justify-center text-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-sky-400/20 border-b-sky-300 animate-spin-reverse" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">
          Running Multi-Spectral Vision Pipeline
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Computing Green Leaf Indices (GLI), Blue-to-Red oceanic attenuation, and morphological edge contours...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-cyan-400 border border-slate-700">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">
          Ready for Intelligence Analysis
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select an Earth or Space observation image and click "Analyze Satellite Image" to resolve features and plain-language insights.
        </p>
      </div>
    );
  }

  const { features, explanation, summary, processing_time_ms, is_demo_analysis } = analysis;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
      {/* Header Status & Mode Badges */}
      <div className="pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">
              Analysis Complete
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-700">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              {processing_time_ms}ms
            </span>
          </div>
        </div>

        {/* Mode Notification Banner */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
          <div className="truncate">
            <span className="text-slate-400">Mode: </span>
            <span className="text-cyan-300 font-medium">
              {is_demo_analysis ? 'Curated Ground Truth Benchmark' : 'Live Pixel CV Inference'}
            </span>
          </div>
          {is_demo_analysis ? (
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold flex-shrink-0">
              Demo Analysis
            </span>
          ) : (
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold flex-shrink-0">
              Live Model
            </span>
          )}
        </div>
      </div>

      {/* Tabs: Features List vs Simple Explanation */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs mb-3">
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'features'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Features ({features.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'explanation'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Simple Explanation</span>
        </button>
      </div>

      {/* Tab 1: Detected Features */}
      {activeTab === 'features' && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {summary}
          </div>

          <div className="space-y-2">
            {features.map((feature) => {
              const isSelected = selectedFeatureId === feature.id;
              return (
                <div
                  key={feature.id}
                  onClick={() => onSelectFeature(isSelected ? null : feature.id)}
                  style={{
                    borderLeftColor: feature.color,
                    borderLeftWidth: '4px'
                  }}
                  className={`group cursor-pointer rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200">
                      {feature.name}
                    </h4>
                    {feature.confidence && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {Math.round(feature.confidence * 100)}% conf
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded-md font-mono uppercase font-semibold text-white"
                      style={{ backgroundColor: feature.color + '33', color: feature.color }}
                    >
                      {feature.category}
                    </span>

                    {feature.area_percentage && (
                      <span className="text-slate-400">
                        Area: ~{feature.area_percentage}%
                      </span>
                    )}

                    <span className="text-slate-500 ml-auto font-mono text-[9px]">
                      {feature.evidence_type === 'curated_ground_truth' ? 'NASA Ground Truth' : 'Live Contour Seg'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Simple-Language Grounded Explanation */}
      {activeTab === 'explanation' && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {/* 1. What am I looking at? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('looking_at')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>1. What am I looking at?</span>
              </span>
              {expandedSection === 'looking_at' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'looking_at' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/60 pt-2">
                {explanation.what_am_i_looking_at}
              </div>
            )}
          </div>

          {/* 2. What was detected? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('detected')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>2. What was detected?</span>
              </span>
              {expandedSection === 'detected' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'detected' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] border-t border-slate-800/60 pt-2 space-y-1.5">
                {explanation.what_was_detected.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. What is happening? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('happening')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>3. What is happening?</span>
              </span>
              {expandedSection === 'happening' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'happening' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/60 pt-2">
                {explanation.what_is_happening}
              </div>
            )}
          </div>

          {/* 4. Why does it matter? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('matters')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>4. Why does it matter?</span>
              </span>
              {expandedSection === 'matters' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'matters' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/60 pt-2">
                {explanation.why_does_it_matter}
              </div>
            )}
          </div>

          {/* 5. How certain is the analysis? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('certainty')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>5. How certain is the analysis?</span>
              </span>
              {expandedSection === 'certainty' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'certainty' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/60 pt-2">
                {explanation.how_certain_is_analysis}
              </div>
            )}
          </div>

          {/* 6. What cannot be determined? */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('limitations')}
              className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>6. Scientific Limitations</span>
              </span>
              {expandedSection === 'limitations' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedSection === 'limitations' && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] border-t border-slate-800/60 pt-2 space-y-1.5">
                {explanation.what_cannot_be_determined.map((lim, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{lim}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
