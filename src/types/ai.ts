// AI 제공업체 타입
export type AIProvider = 'gemini' | 'chatgpt' | 'claude';

// AI 모델 인터페이스
export interface AIModel {
  id: string;
  name: string;
  pricePer1M: number;
}

// AI 작업 타입
export type AITask = 'tone-conversion' | 'translation';

// 톤 타입
export type ToneType = 'formal' | 'general' | 'friendly';

// API 응답 타입 (톤 변환용)
export interface AIApiResponse {
  formal: string;
  general: string;
  friendly: string;
}

// 번역 응답 타입
export interface TranslationResponse {
  success: boolean;
  translatedText: string;
  detectedLanguage: string;
  error?: string;
}

// AI 서비스 옵션
export interface AIServiceOptions {
  provider: AIProvider;
  model: string;
  apiKey: string;
  targetLanguage?: string;
}

// 제공자별 상세 요청 인터페이스
export interface GeminiApiRequest {
  contents: Array<{ parts: Array<{ text: string }> }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    candidateCount: number;
    topK: number;
    topP: number;
    responseMimeType?: string;
  };
  safetySettings?: Array<{ category: string; threshold: string }>;
}

export interface OpenAIApiRequest {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature: number;
  max_tokens: number;
  response_format?: { type: 'json_object' };
}

export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

