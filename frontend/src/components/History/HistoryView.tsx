import React from 'react';
import { 
  History, 
  Trash2, 
  Clock, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import type { HistoryItem } from '../../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onExploreSamples: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onExploreSamples
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">
              Analysis History
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 font-mono text-cyan-300">
              {history.length} records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persisted locally in your browser storage. No data is sent to external cloud databases.</span>
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all local analysis history?')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">
              No Analysis History Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run computer vision analysis on any NASA satellite image from the workspace to record results here.
            </p>
          </div>
          <button
            onClick={onExploreSamples}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-slate-950 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Explore NASA Images</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all flex gap-4 items-center"
            >
              {item.thumbnail_url ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                  <img
                    src={item.thumbnail_url}
                    alt={item.image_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <Layers className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                    {item.top_category}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.image_title}
                </h4>

                <p className="text-xs text-slate-400">
                  {item.feature_count} features detected ·{' '}
                  <span className="text-slate-500">
                    {item.analysis.is_demo_analysis ? 'Demo Analysis' : 'Live Inference'}
                  </span>
                </p>

                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium pt-1"
                >
                  <span>Reopen Result</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
