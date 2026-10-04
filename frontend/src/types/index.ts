export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface DetectedFeature {
  id: string;
  name: string;
  category: string;
  confidence?: number;
  description: string;
  bbox: BoundingBox;
  polygon?: PolygonPoint[];
  area_percentage?: number;
  color: string;
  evidence_type: string;
}

export interface SimpleExplanation {
  what_am_i_looking_at: string;
  what_was_detected: string[];
  what_is_happening: string;
  why_does_it_matter: string;
  how_certain_is_analysis: string;
  what_cannot_be_determined: string[];
}

export interface AnalysisResponse {
  image_title: string;
  analysis_status: string;
  analysis_mode: 'live_cv_inference' | 'curated_ground_truth' | 'multimodal_api';
  model_used: string;
  is_demo_analysis: boolean;
  features: DetectedFeature[];
  summary: string;
  observations: string[];
  limitations: string[];
  explanation: SimpleExplanation;
  image_metadata: Record<string, any>;
  processing_time_ms: number;
  annotated_image_base64?: string;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  location?: string;
  coordinates?: string;
  capture_date?: string;
  source: string;
  mission?: string;
  source_url: string;
  image_url: string;
  thumbnail_url: string;
  resolution?: string;
  description: string;
  verified: boolean;
  key_features: string[];
}

export interface NASAImageSearchResult {
  nasa_id: string;
  title: string;
  description?: string;
  date_created?: string;
  center?: string;
  thumbnail_url: string;
  image_url: string;
  keywords: string[];
}

export interface ModelStatus {
  status: string;
  active_engine: string;
  cv_engine_available: boolean;
  multimodal_api_available: boolean;
  api_provider?: string;
  supported_categories: string[];
  version: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  image_title: string;
  thumbnail_url?: string;
  feature_count: number;
  top_category: string;
  analysis: AnalysisResponse;
}
