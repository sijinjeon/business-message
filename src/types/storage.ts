import { AIProvider, ToneType } from './ai';

export type TargetLanguage = 'ko' | 'en' | 'ja' | 'zh-CN';

export interface TranslationSettings {
  defaultTargetLanguage: TargetLanguage;
  preserveLineBreaks: boolean;
  showNotification: boolean;
}

export interface UsageLog {
  timestamp: number;
  provider: AIProvider;
  model: string;
  task: 'tone-conversion' | 'translation';
  inputTokens?: number;
  outputTokens?: number;
  cost?: number; // Estimated cost based on model price
}

export interface AppStorage {
  apiKeys: {
    gemini: string;
    chatgpt: string;
    claude: string;
  };
  dailyUsage: {
    date: string;
    count: number;
  };
  usageLogs?: UsageLog[];
  settings: {
    selectedProvider: AIProvider;
    providerModels: {
      gemini: string;
      chatgpt: string;
      claude: string;
    };
    temperature: number;
    maxOutputTokens: number;
    autoCopyEnabled: boolean;
    autoCopyTone: ToneType;
    instantToneStyle: ToneType;
    translation: TranslationSettings;
  };
  lastUsedTab: 'tone' | 'translation';
}

