// AI 제공업체 타입
export type AIProvider = 'gemini' | 'chatgpt' | 'claude';

// Chrome Storage 데이터 스키마
export interface AppStorage {
  apiKeys: {
    gemini: string; // 암호화된 Gemini API 키
    chatgpt: string; // 암호화된 OpenAI API 키
    claude: string; // 암호화된 Anthropic API 키
  };
  dailyUsage: {
    date: string; // 'YYYY-MM-DD'
    count: number; // 사용 횟수
  };
  settings: {
    selectedProvider: AIProvider; // 선택된 AI 제공업체
    preferredModel: string;
    temperature: number; // 0.1 ~ 1.0
    maxOutputTokens: number; // 기본 1024
    autoCopyEnabled: boolean; // 자동 클립보드 복사 여부
    autoCopyTone: 'formal' | 'general' | 'friendly'; // 자동 복사할 톤
  };
}

// API 응답 타입 (모든 AI 제공업체 공통)
export interface AIApiResponse {
  formal: string;
  general: string;
  friendly: string;
}

// Gemini API 요청 타입
export interface GeminiApiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    candidateCount: number;
    topK: number;
    topP: number;
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

// OpenAI API 요청 타입
export interface OpenAIApiRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
}

// Claude API 요청 타입
export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// 컴포넌트 Props 타입들
export interface ResultCardProps {
  tone: 'formal' | 'general' | 'friendly';
  text: string;
  onCopy: (text: string) => void;
  isDefaultSelected?: boolean;
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
}

export interface ActionBarProps {
  onRegenerate: () => void;
  onReadClipboard: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
}

// 상태 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  inputText: string;
  results: AIApiResponse | null;
  loadingState: LoadingState;
  message: string;
  messageType: 'error' | 'success' | '';
  remainingUsage: number;
}
