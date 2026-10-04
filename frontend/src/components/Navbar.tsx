import React from 'react';
import { Globe2, Satellite, History, Info, Compass, Activity } from 'lucide-react';
import type { ModelStatus } from '../types';

interface NavbarProps {
  currentTab: 'workspace' | 'explorer' | 'history' | 'about';
  setCurrentTab: (tab: 'workspace' | 'explorer' | 'history' | 'about') => void;
  modelStatus: ModelStatus | null;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  modelStatus,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('workspace')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-cyan-400 animate-spin-slow group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                TerraVision <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 tracking-wider">
                NASA Space Apps
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              See our planet differently. Understand it intelligently.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentTab('workspace')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'workspace'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>AI Workspace</span>
          </button>

          <button
            onClick={() => setCurrentTab('explorer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'explorer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Image Explorer</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
              currentTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-600 text-white font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('about')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'about'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Methodology</span>
          </button>
        </nav>

        {/* Engine status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Engine:</span>
          <span className="text-cyan-300 font-mono font-medium">
            {modelStatus?.active_engine.includes('Multi-Spectral') ? 'EarthVision CV' : 'Active'}
          </span>
        </div>
      </div>
    </header>
  );
};
