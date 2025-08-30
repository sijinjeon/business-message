// Chrome Storage 데이터 스키마
export interface AppStorage {
  userApiKey: string; // 암호화된 API 키
  dailyUsage: {
    date: string; // 'YYYY-MM-DD'
    count: number; // 사용 횟수
  };
  settings: {
    preferredModel: 'gemini-2.0-flash-exp';
    temperature: number; // 0.1 ~ 1.0
    maxOutputTokens: number; // 기본 1024
  };
}

// API 응답 타입
export interface GeminiApiResponse {
  formal: string;
  general: string;
  friendly: string;
}

// API 요청 타입
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
  remainingCount: number;
  isLoading: boolean;
  onOpenSettings: () => void;
}

// 상태 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  inputText: string;
  results: GeminiApiResponse | null;
  loadingState: LoadingState;
  errorMessage: string;
  remainingUsage: number;
}
