// ADEVeil — Future AI Architecture Stubs
// Interfaces for optional future local AI integration. No online dependency.

export interface AIAssistant {
  model: string;
  isLocal: boolean;
  capabilities: ('tag' | 'summarize' | 'search' | 'categorize')[];
}

export interface SmartTag {
  text: string;
  confidence: number;
  source: 'ai' | 'user';
}

export interface AITagRequest {
  content: string;
  existingTags: string[];
}

export interface AITagResponse {
  suggestedTags: SmartTag[];
  processingTimeMs: number;
}

export interface AISummaryRequest {
  content: string;
  maxLength?: number;
}

export interface AISummaryResponse {
  summary: string;
  confidence: number;
}
