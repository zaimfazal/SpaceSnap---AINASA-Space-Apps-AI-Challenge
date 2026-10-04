import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageControls } from './components/Workspace/ImageControls';
import { InteractiveViewer } from './components/Workspace/InteractiveViewer';
import { InsightsPanel } from './components/Workspace/InsightsPanel';
import { ExplorerView } from './components/Explorer/ExplorerView';
import { HistoryView } from './components/History/HistoryView';
import { AboutView } from './components/About/AboutView';
import { 
  fetchSamples, 
  fetchModelStatus, 
  analyzeImage, 
  searchNASAImages, 
  getLocalHistory, 
  saveHistoryItem, 
  clearLocalHistory 
} from './services/api';
import type { 
  SampleImage, 
  NASAImageSearchResult, 
  AnalysisResponse, 
  ModelStatus, 
  HistoryItem 
} from './types';
import { AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'workspace' | 'explorer' | 'history' | 'about'>('workspace');
  
  // Data states
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(null);
  const [activeImageSource, setActiveImageSource] = useState<'sample' | 'upload' | 'url'>('sample');
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');
  const [activeImageTitle, setActiveImageTitle] = useState<string>('');
  
  // Upload & Custom URL
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  
  // NASA Search
  const [nasaSearchResults, setNasaSearchResults] = useState<NASAImageSearchResult[]>([]);
  const [isSearchingNASA, setIsSearchingNASA] = useState<boolean>(false);
  
  // Analysis & Viewer State
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [forceLiveCv, setForceLiveCv] = useState<boolean>(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial Load: Fetch samples, model status, history
  useEffect(() => {
    async function initApp() {
      try {
        const [sampleList, status] = await Promise.all([
          fetchSamples(),
          fetchModelStatus().catch(() => null)
        ]);

        setSamples(sampleList);
        if (status) setModelStatus(status);
        setHistory(getLocalHistory());

        if (sampleList.length > 0) {
          const first = sampleList[0];
          setSelectedSample(first);
          setActiveImageUrl(first.image_url);
          setActiveImageTitle(first.title);
          setActiveImageSource('sample');

          // Trigger initial automated analysis for immediate demonstration
          triggerAnalysis(first.id, undefined, first.title, false);
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setErrorMessage('Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
      }
    }

    initApp();
  }, []);

  const triggerAnalysis = async (
    sampleId?: string,
    file?: File,
    title?: string,
    useLiveCv: boolean = false,
    url?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setSelectedFeatureId(null);

    try {
      const result = await analyzeImage({
        sampleId,
        file,
        imageUrl: url,
        title,
        forceLiveCv: useLiveCv
      });

      setAnalysis(result);
      // Persist to local browser history
      const saved = saveHistoryItem(result, result.annotated_image_base64 || activeImageUrl);
      setHistory((prev) => [saved, ...prev.filter((p) => p.image_title !== saved.image_title)].slice(0, 20));
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'Analysis pipeline encountered an error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedSample(sample);
    setActiveImageUrl(sample.image_url);
    setActiveImageTitle(sample.title);
    setActiveImageSource('sample');
    setAnalysis(null);
  };

  const handleUploadFile = (file: File) => {
    setUploadedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(objectUrl);
    setActiveImageUrl(objectUrl);
    setActiveImageTitle(file.name.replace(/\.[^/.]+$/, ''));
    setActiveImageSource('upload');
    setSelectedSample(null);
    setAnalysis(null);
  };

  const handleClearUploadedFile = () => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    if (samples.length > 0) {
      handleSelectSample(samples[0]);
    }
  };

  const handleSelectUrl = (url: string, title?: string) => {
    setCustomUrl(url);
    setActiveImageUrl(url);
    setActiveImageTitle(title || 'Remote Satellite Image');
    setActiveImageSource('url');
    setSelectedSample(null);
    setAnalysis(null);
  };

  const handleSearchNASA = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingNASA(true);
    setErrorMessage(null);
    try {
      const results = await searchNASAImages(query);
      setNasaSearchResults(results);
    } catch (err: any) {
      console.error('NASA search error:', err);
      setErrorMessage('Could not complete NASA API search. Check your network connection.');
    } finally {
      setIsSearchingNASA(false);
    }
  };

  const handleExecuteAnalysis = (liveCv: boolean = forceLiveCv) => {
    if (activeImageSource === 'sample' && selectedSample) {
      triggerAnalysis(selectedSample.id, undefined, selectedSample.title, liveCv);
    } else if (activeImageSource === 'upload' && uploadedFile) {
      triggerAnalysis(undefined, uploadedFile, activeImageTitle, true);
    } else if (activeImageSource === 'url' && activeImageUrl) {
      triggerAnalysis(undefined, undefined, activeImageTitle, true, activeImageUrl);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setAnalysis(item.analysis);
    setActiveImageTitle(item.image_title);
    if (item.thumbnail_url) {
      setActiveImageUrl(item.thumbnail_url);
    }
    setCurrentTab('workspace');
  };

  const handleClearHistory = () => {
    clearLocalHistory();
    setHistory([]);
  };

  const handleSelectAndAnalyzeFromExplorer = (sample: SampleImage) => {
    handleSelectSample(sample);
    setCurrentTab('workspace');
    triggerAnalysis(sample.id, undefined, sample.title, false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-slate-100 space-grid-bg selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        modelStatus={modelStatus}
        historyCount={history.length}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 w-full mt-3">
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-red-900/60 rounded text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* VIEW 1: AI ANALYSIS WORKSPACE */}
        {currentTab === 'workspace' && (
          <div className="max-w-[1720px] mx-auto p-3 lg:p-5 h-[calc(100vh-66px)] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Left Panel: Image Controls (3 cols on large) */}
              <div className="lg:col-span-3 h-full overflow-hidden">
                <ImageControls
                  samples={samples}
                  selectedSample={selectedSample}
                  onSelectSample={handleSelectSample}
                  uploadedFile={uploadedFile}
                  uploadedPreviewUrl={uploadedPreviewUrl}
                  onUploadFile={handleUploadFile}
                  onClearUploadedFile={handleClearUploadedFile}
                  customUrl={customUrl}
                  setCustomUrl={setCustomUrl}
                  onSelectUrl={handleSelectUrl}
                  activeImageSource={activeImageSource}
                  setActiveImageSource={setActiveImageSource}
                  activeImageUrl={activeImageUrl}
                  activeImageTitle={activeImageTitle}
                  onAnalyze={handleExecuteAnalysis}
                  isAnalyzing={isAnalyzing}
                  forceLiveCv={forceLiveCv}
                  setForceLiveCv={setForceLiveCv}
                  nasaSearchResults={nasaSearchResults}
                  onSearchNASA={handleSearchNASA}
                  isSearchingNASA={isSearchingNASA}
                />
              </div>

              {/* Center Panel: Interactive Viewer (6 cols on large) */}
              <div className="lg:col-span-6 h-full overflow-hidden">
                <InteractiveViewer
                  imageUrl={activeImageUrl}
                  annotatedImageUrl={analysis?.annotated_image_base64}
                  analysis={analysis}
                  selectedFeatureId={selectedFeatureId}
                  onSelectFeature={setSelectedFeatureId}
                  isAnalyzing={isAnalyzing}
                  imageTitle={activeImageTitle}
                />
              </div>

              {/* Right Panel: AI Insights & Simple Explanation (3 cols on large) */}
              <div className="lg:col-span-3 h-full overflow-hidden">
                <InsightsPanel
                  analysis={analysis}
                  selectedFeatureId={selectedFeatureId}
                  onSelectFeature={setSelectedFeatureId}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: IMAGE EXPLORER */}
        {currentTab === 'explorer' && (
          <ExplorerView
            samples={samples}
            onSelectAndAnalyze={handleSelectAndAnalyzeFromExplorer}
          />
        )}

        {/* VIEW 3: ANALYSIS HISTORY */}
        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onExploreSamples={() => setCurrentTab('explorer')}
          />
        )}

        {/* VIEW 4: METHODOLOGY & ABOUT */}
        {currentTab === 'about' && <AboutView />}
      </main>
    </div>
  );
};

export default App;
