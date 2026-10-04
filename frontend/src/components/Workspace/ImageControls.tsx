import { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  MapPin, 
  Cpu, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Loader2
} from 'lucide-react';
import type { SampleImage, NASAImageSearchResult } from '../../types';

interface ImageControlsProps {
  samples: SampleImage[];
  selectedSample: SampleImage | null;
  onSelectSample: (sample: SampleImage) => void;
  uploadedFile: File | null;
  uploadedPreviewUrl: string | null;
  onUploadFile: (file: File) => void;
  onClearUploadedFile: () => void;
  customUrl: string;
  setCustomUrl: (url: string) => void;
  onSelectUrl: (url: string, title?: string) => void;
  activeImageSource: 'sample' | 'upload' | 'url';
  setActiveImageSource: (source: 'sample' | 'upload' | 'url') => void;
  activeImageUrl: string;
  activeImageTitle: string;
  onAnalyze: (forceLiveCv?: boolean) => void;
  isAnalyzing: boolean;
  forceLiveCv: boolean;
  setForceLiveCv: (val: boolean) => void;
  nasaSearchResults: NASAImageSearchResult[];
  onSearchNASA: (query: string) => void;
  isSearchingNASA: boolean;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  samples,
  selectedSample,
  onSelectSample,
  uploadedFile,
  uploadedPreviewUrl,
  onUploadFile,
  onClearUploadedFile,
  customUrl,
  setCustomUrl,
  onSelectUrl,
  activeImageSource,
  setActiveImageSource,
  activeImageUrl,
  activeImageTitle,
  onAnalyze,
  isAnalyzing,
  forceLiveCv,
  setForceLiveCv,
  nasaSearchResults,
  onSearchNASA,
  isSearchingNASA
}) => {
  const [controlTab, setControlTab] = useState<'samples' | 'search' | 'upload' | 'url'>('samples');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState(customUrl || '');

  const popularSearches = [
    'Hurricane',
    'Earth from space',
    'Wildfire',
    'Amazon rainforest',
    'Arctic ice',
    'Volcano'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadFile(file);
      setActiveImageSource('upload');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setCustomUrl(urlInput.trim());
      onSelectUrl(urlInput.trim(), 'Remote Satellite Observation');
      setActiveImageSource('url');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs mb-4">
        <button
          onClick={() => setControlTab('samples')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            controlTab === 'samples'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Samples</span>
        </button>

        <button
          onClick={() => setControlTab('search')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            controlTab === 'search'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>NASA Search</span>
        </button>

        <button
          onClick={() => setControlTab('upload')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            controlTab === 'upload'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setControlTab('url')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            controlTab === 'url'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>URL</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-3">
        {/* TAB 1: SAMPLES */}
        {controlTab === 'samples' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Curated NASA Earth Observatory ({samples.length})</span>
              <span className="text-[10px] text-cyan-400 font-mono">Verified Imagery</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {samples.map((sample) => {
                const isSelected = activeImageSource === 'sample' && selectedSample?.id === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      setActiveImageSource('sample');
                    }}
                    className={`group cursor-pointer rounded-xl p-2.5 transition-all flex gap-3 items-center border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-800">
                      <img
                        src={sample.thumbnail_url}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                          {sample.category}
                        </span>
                        {sample.location && (
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                            {sample.location}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-200">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {sample.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: NASA SEARCH */}
        {controlTab === 'search' && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search NASA Imagery Library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchNASA(searchQuery)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-9"
              />
              <button
                onClick={() => onSearchNASA(searchQuery)}
                disabled={isSearchingNASA}
                className="absolute right-1.5 top-1.5 p-1 bg-cyan-600/40 hover:bg-cyan-600 text-cyan-300 rounded-lg transition-colors"
              >
                {isSearchingNASA ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                Suggested Topics:
              </span>
              <div className="flex flex-wrap gap-1">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      onSearchNASA(term);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-2 mt-2">
              {isSearchingNASA && (
                <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Connecting to NASA API...</span>
                </div>
              )}

              {!isSearchingNASA && nasaSearchResults.length === 0 && searchQuery && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No NASA images found for "{searchQuery}". Try another keyword.
                </div>
              )}

              {nasaSearchResults.map((res) => {
                const isSelected = activeImageUrl === res.image_url;
                return (
                  <div
                    key={res.nasa_id}
                    onClick={() => {
                      onSelectUrl(res.image_url, res.title);
                      setActiveImageSource('url');
                    }}
                    className={`group cursor-pointer rounded-xl p-2 transition-all flex gap-2.5 items-center border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-800">
                      <img
                        src={res.thumbnail_url}
                        alt={res.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-mono text-cyan-400">
                        NASA {res.center || 'JPL'} · {res.date_created}
                      </span>
                      <h5 className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-200">
                        {res.title}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD IMAGE */}
        {controlTab === 'upload' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl cursor-pointer bg-slate-950/40 hover:bg-cyan-950/10 transition-all text-center">
              <Upload className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
              <span className="text-xs font-medium text-slate-200">
                Click or drag & drop satellite image
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Supports JPG, PNG, WEBP (Max 20MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedFile && uploadedPreviewUrl && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={uploadedPreviewUrl}
                    alt="Upload Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                      {uploadedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClearUploadedFile}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMAGE URL */}
        {controlTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Public Satellite Image URL:
              </label>
              <input
                type="url"
                required
                placeholder="https://eoimages.gsfc.nasa.gov/...jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl border border-slate-600 transition-colors"
            >
              Load Remote Image
            </button>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                SSRF-Protected: Remote URLs are verified against private and reserved IP addresses.
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Selected Image Metadata Card */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 mb-3 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">
            Current Target
          </span>
          {selectedSample?.verified && activeImageSource === 'sample' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> NASA Verified
            </span>
          )}
        </div>
        <p className="font-medium text-slate-200 truncate mb-1">
          {activeImageTitle}
        </p>

        {activeImageSource === 'sample' && selectedSample && (
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            {selectedSample.mission && (
              <span className="truncate">Sensors: {selectedSample.mission}</span>
            )}
            {selectedSample.capture_date && (
              <span className="truncate">Date: {selectedSample.capture_date}</span>
            )}
            {selectedSample.coordinates && (
              <span className="truncate col-span-2">Coords: {selectedSample.coordinates}</span>
            )}
          </div>
        )}
      </div>

      {/* Analysis Mode Toggle (when sample is selected) */}
      {activeImageSource === 'sample' && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 mb-3 text-[11px]">
          <span className="text-slate-400">Analysis Engine:</span>
          <button
            onClick={() => setForceLiveCv(!forceLiveCv)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] border border-cyan-500/30"
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            {forceLiveCv ? 'Live Pixel CV' : 'NASA Benchmark GT'}
          </button>
        </div>
      )}

      {/* Main Analyze Action Button */}
      <button
        onClick={() => onAnalyze(forceLiveCv)}
        disabled={isAnalyzing || !activeImageUrl}
        className="relative group overflow-hidden w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Scanning Multi-Spectral Bands...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Analyze Satellite Image</span>
          </>
        )}
      </button>
    </div>
  );
};
