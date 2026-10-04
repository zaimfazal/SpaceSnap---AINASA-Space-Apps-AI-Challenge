import { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';
import type { SampleImage } from '../../types';

interface ExplorerViewProps {
  samples: SampleImage[];
  onSelectAndAnalyze: (sample: SampleImage) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  samples,
  onSelectAndAnalyze
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Earth & Space Scenes' },
    { id: 'storms', name: 'Storms & Clouds' },
    { id: 'vegetation', name: 'Forests & Canopy' },
    { id: 'oceans', name: 'Oceans & Blooms' },
    { id: 'wildfires', name: 'Wildfires & Smoke' },
    { id: 'ice', name: 'Cryosphere & Glaciers' },
    { id: 'geology', name: 'Geological Craters' },
    { id: 'urban', name: 'Urban Land Use' },
    { id: 'volcanoes', name: 'Volcanoes & Calderas' }
  ];

  const filteredSamples = selectedCategory === 'all'
    ? samples
    : samples.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated NASA Earth Observatory Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-400 bg-clip-text text-transparent">
          Explore Earth Through Intelligence
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Access verified high-resolution satellite imagery captured by NASA and USGS orbital platforms. 
          Select any scene to inspect multi-spectral features and generate AI explanations.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Curated Samples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSamples.map((sample) => (
          <div
            key={sample.id}
            className="group rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden flex flex-col hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/30 transition-all duration-300"
          >
            {/* Image Preview Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
              <img
                src={sample.image_url}
                alt={sample.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {sample.category}
                </span>
                {sample.verified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {sample.resolution && (
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-md">
                  {sample.resolution}
                </div>
              )}
            </div>

            {/* Card Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {sample.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      {sample.location}
                    </span>
                  )}
                  {sample.capture_date && (
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {sample.capture_date}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {sample.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sample.description}
                </p>

                {sample.key_features && sample.key_features.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {sample.key_features.map((kf, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {kf}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={sample.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>{sample.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onSelectAndAnalyze(sample)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold text-xs border border-cyan-500/40 transition-all shadow-sm"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
