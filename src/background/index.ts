// BCA Background Service Worker
import { setupCommandListeners } from './commands';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { getStorageData } from '../utils/storage';
import { decryptData } from '../utils/crypto';

console.log('BCA Background Service Worker Initialized');

// 단축키 리스너 설정
setupCommandListeners();

/**
 * 런타임 메시지 리스너 (Content Script나 Popup의 요청 처리)
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // AI 직접 호출 요청 (Content Script에서 페이지 번역 시 사용)
  if (request.action === 'CALL_AI_API') {
    handleAICall(request.payload).then(sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }

  return false;
});

/**
 * AI 호출 핸들러
 */
async function handleAICall(payload: any) {
  try {
    const data = await getStorageData();
    const { settings, apiKeys } = data;
    const provider = settings.selectedProvider;
    const model = settings.providerModels[provider];
    const encryptedKey = apiKeys[provider];

    if (!encryptedKey) throw new Error(`${provider} API 키가 설정되지 않았습니다.`);

    const apiKey = await decryptData(encryptedKey);
    const targetLanguage = payload.targetLanguage || settings.translation.defaultTargetLanguage;

    const response = await AIOrchestrator.execute(payload.text, payload.task, {
      provider,
      model,
      apiKey,
      targetLanguage
    });

    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
