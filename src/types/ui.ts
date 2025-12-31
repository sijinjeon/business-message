import { AIApiResponse, ToneType } from './ai';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  inputText: string;
  results: Partial<AIApiResponse> | null;
  translationResult: string | null;
  activeTab: 'tone' | 'translation';
  loadingState: LoadingState;
  message: string;
  messageType: 'error' | 'success' | '';
  remainingUsage: number;
}

export type TabId = 'tone' | 'translation';

// 컴포넌트 Props 타입 정의
export interface ResultCardProps {
  tone: ToneType;
  text?: string;
  onCopy: (text: string) => Promise<void> | void;
  isDefaultSelected?: boolean;
  onConvert?: (tone: ToneType) => void;
  isLoading?: boolean;
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
  activeTab: 'tone' | 'translation';
}

