import type {
  SampleImage,
  NASAImageSearchResult,
  AnalysisResponse,
  ModelStatus,
  HistoryItem
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; service: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}

export async function fetchSamples(): Promise<SampleImage[]> {
  const res = await fetch(`${API_BASE}/images/samples`);
  if (!res.ok) throw new Error(`Failed to load samples (${res.status})`);
  return res.json();
}

export async function searchNASAImages(query: string): Promise<NASAImageSearchResult[]> {
  const res = await fetch(`${API_BASE}/images/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`NASA Search failed (${res.status})`);
  return res.json();
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  const res = await fetch(`${API_BASE}/models/status`);
  if (!res.ok) throw new Error(`Failed to get model status (${res.status})`);
  return res.json();
}

export async function analyzeImage({
  file,
  imageUrl,
  sampleId,
  title,
  forceLiveCv = false
}: {
  file?: File;
  imageUrl?: string;
  sampleId?: string;
  title?: string;
  forceLiveCv?: boolean;
}): Promise<AnalysisResponse> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (imageUrl) {
    formData.append('image_url', imageUrl);
  }
  if (sampleId) {
    formData.append('sample_id', sampleId);
  }
  if (title) {
    formData.append('title', title);
  }
  if (forceLiveCv) {
    formData.append('force_live_cv', 'true');
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    let errMessage = `Analysis failed with HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errMessage = errJson.detail;
    } catch {
      // fallback
    }
    throw new Error(errMessage);
  }

  return res.json();
}

// Local History Persistence
const HISTORY_STORAGE_KEY = 'terravision_analysis_history_v1';

export function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read history from localStorage:', e);
    return [];
  }
}

export function saveHistoryItem(analysis: AnalysisResponse, thumbnailUrl?: string): HistoryItem {
  const history = getLocalHistory();
  const topCat = analysis.features[0]?.category || 'satellite';
  const newItem: HistoryItem = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    image_title: analysis.image_title,
    thumbnail_url: thumbnailUrl || analysis.annotated_image_base64,
    feature_count: analysis.features.length,
    top_category: topCat,
    analysis
  };

  const updated = [newItem, ...history.filter(h => h.image_title !== newItem.image_title)].slice(0, 20);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Storage full or unavailable, trimming history:', e);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 5)));
    } catch {}
  }
  return newItem;
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
