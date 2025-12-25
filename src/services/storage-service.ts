import { AppStorage, AIProvider } from '../types';

const DEFAULT_STORAGE: AppStorage = {
  apiKeys: { gemini: '', chatgpt: '', claude: '' },
  dailyUsage: {
    date: new Date().toISOString().split('T')[0],
    count: 0
  },
  settings: {
    selectedProvider: 'gemini',
    providerModels: {
      gemini: 'gemini-3-flash',
      chatgpt: 'gpt-5.2',
      claude: 'claude-4-5-sonnet'
    },
    temperature: 0.7,
    maxOutputTokens: 1024,
    autoCopyEnabled: true,
    autoCopyTone: 'formal',
    instantToneStyle: 'formal',
    translation: {
      defaultTargetLanguage: 'ko',
      preserveLineBreaks: true,
      showNotification: true
    }
  },
  lastUsedTab: 'tone'
};

export class StorageService {
  /**
   * 전체 스토리지 데이터 가져오기 (기본값 병합)
   */
  static async getAll(): Promise<AppStorage> {
    const result = await chrome.storage.local.get(null);
    return this.deepMerge(DEFAULT_STORAGE, result) as AppStorage;
  }

  /**
   * 특정 경로의 데이터 업데이트
   */
  static async update(data: Partial<AppStorage>): Promise<void> {
    await chrome.storage.local.set(data);
  }

  /**
   * 설정(settings) 업데이트
   */
  static async updateSettings(settings: Partial<AppStorage['settings']>): Promise<void> {
    const current = await this.getAll();
    await this.update({
      settings: { ...current.settings, ...settings }
    });
  }

  /**
   * 제공자별 API 키 저장 (암호화된 값 전달받음)
   */
  static async saveApiKey(provider: AIProvider, encryptedKey: string): Promise<void> {
    const current = await this.getAll();
    await this.update({
      apiKeys: { ...current.apiKeys, [provider]: encryptedKey }
    });
  }

  /**
   * 마이그레이션 및 기본값 병합 유틸리티
   */
  private static deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (source && typeof source === 'object') {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  }
}

