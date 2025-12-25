import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage-service';
import { AppStorage, AIProvider } from '../types';
import { decryptData, encryptData } from '../utils/crypto';

export function useSettings() {
  const [settings, setSettings] = useState<AppStorage['settings'] | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({ gemini: '', chatgpt: '', claude: '' });
  const [lastUsedTab, setLastUsedTabState] = useState<'tone' | 'translation'>('tone');
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.getAll();
      setSettings(data.settings);
      setLastUsedTabState(data.lastUsedTab);
      
      // API 키 복호화하여 상태에 저장 (UI 표시용)
      const decryptedKeys = {
        gemini: data.apiKeys.gemini ? await decryptData(data.apiKeys.gemini) : '',
        chatgpt: data.apiKeys.chatgpt ? await decryptData(data.apiKeys.chatgpt) : '',
        claude: data.apiKeys.claude ? await decryptData(data.apiKeys.claude) : ''
      };
      setApiKeys(decryptedKeys);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateSettings = async (newSettings: Partial<AppStorage['settings']>) => {
    await StorageService.updateSettings(newSettings);
    setSettings(prev => prev ? { ...prev, ...newSettings } : null);
  };

  const updateApiKey = async (provider: AIProvider, key: string) => {
    const encrypted = await encryptData(key);
    await StorageService.saveApiKey(provider, encrypted);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const updateLastUsedTab = async (tab: 'tone' | 'translation') => {
    await StorageService.update({ lastUsedTab: tab });
    setLastUsedTabState(tab);
  };

  return {
    settings,
    apiKeys,
    lastUsedTab,
    isLoading,
    updateSettings,
    updateApiKey,
    updateLastUsedTab,
    refresh: loadAll
  };
}

