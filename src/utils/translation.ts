// BCA Translation Utilities
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { AppStorage, TargetLanguage, TranslationResponse } from '../types';
import { decryptData } from './crypto';

/**
 * 텍스트에서 언어를 빠르게 감지 (휴리스틱)
 */
export function quickDetectLanguage(text: string): string {
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) return 'ko';
  if (/[\u3040-\u309F|\u30A0-\u30FF]/.test(text)) return 'ja';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  return 'en'; // 기본값 (영어 또는 기타)
}

/**
 * 언어 코드를 표시용 이름으로 변환
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    ko: '한국어',
    en: '영어',
    ja: '일본어',
    zh: '중국어',
    'zh-CN': '중국어(간체)'
  };
  return names[code] || code;
}

/**
 * 메인 번역 함수
 */
export async function translateText(
  text: string,
  targetLanguage: TargetLanguage,
  settings: AppStorage['settings'],
  apiKeys: AppStorage['apiKeys']
): Promise<TranslationResponse> {
  const provider = settings.selectedProvider;
  const model = settings.providerModels[provider];
  const encryptedKey = apiKeys[provider];

  if (!encryptedKey) {
    return {
      success: false,
      translatedText: '',
      detectedLanguage: '',
      error: `${provider} API 키가 설정되지 않았습니다.`
    };
  }

  try {
    const apiKey = await decryptData(encryptedKey);

    const response = await AIOrchestrator.execute(text, 'translation', {
      provider,
      model,
      apiKey,
      targetLanguage
    });

    return {
      success: true,
      translatedText: response as string,
      detectedLanguage: quickDetectLanguage(text)
    };
  } catch (error: any) {
    return {
      success: false,
      translatedText: '',
      detectedLanguage: '',
      error: error.message
    };
  }
}

