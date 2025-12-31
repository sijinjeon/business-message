// BCA Background Service Worker
import { setupCommandListeners } from './commands';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { getStorageData } from '../utils/storage';
import { decryptData } from '../utils/crypto';

console.log('[BCA] Background Service Worker Initialized');

/**
 * 서비스 워커 설치 및 업데이트 시 초기화
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[BCA] Extension installed');
  } else if (details.reason === 'update') {
    console.log(`[BCA] Extension updated to version ${chrome.runtime.getManifest().version}`);
  }
  
  // 초기 알람 설정
  setupHeartbeat();
});

/**
 * 서비스 워커가 시작될 때마다 실행되는 초기화 로직
 */
async function setupHeartbeat() {
  const alarm = await chrome.alarms.get('bca-heartbeat');
  if (!alarm) {
    chrome.alarms.create('bca-heartbeat', { periodInMinutes: 0.5 });
    console.log('[BCA] Heartbeat alarm created');
  }
}

// 서비스 워커가 로드될 때 즉시 실행
setupHeartbeat();

/**
 * Keep-alive를 위한 알람 리스너
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'bca-heartbeat') {
    // 알람 발생 시 서비스 워커가 활성화됨
    // console.debug('[BCA] Heartbeat');
  }
});

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

  // 서비스 워커 상태 확인을 위한 PING
  if (request.action === 'PING_BKG') {
    sendResponse({ status: 'active', timestamp: Date.now() });
    return true;
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
