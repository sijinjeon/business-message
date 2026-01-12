// BCA Background Service Worker
import { setupCommandListeners } from './commands';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { getStorageData } from '../utils/storage';
import { decryptData } from '../utils/crypto';

console.log('[BCA] Background Service Worker Initialized', new Date().toISOString());

// 서비스 워커 시작 시간 기록
const SW_START_TIME = Date.now();

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
  
  // 설치/업데이트 시 단축키 상태 로깅
  logCommandsStatus();
});

/**
 * 등록된 단축키 상태 로깅
 */
async function logCommandsStatus() {
  try {
    const commands = await chrome.commands.getAll();
    console.log('[BCA] Registered shortcuts:', commands.map(c => ({
      name: c.name,
      shortcut: c.shortcut || '(not set)',
      description: c.description
    })));
    
    // 단축키가 설정되지 않은 명령어 경고
    const unsetCommands = commands.filter(c => !c.shortcut && c.name !== '_execute_action');
    if (unsetCommands.length > 0) {
      console.warn('[BCA] Commands without shortcuts:', unsetCommands.map(c => c.name));
    }
  } catch (e) {
    console.error('[BCA] Failed to get commands:', e);
  }
}

/**
 * 서비스 워커가 시작될 때마다 실행되는 초기화 로직
 */
async function setupHeartbeat() {
  try {
    const alarm = await chrome.alarms.get('bca-heartbeat');
    if (!alarm) {
      await chrome.alarms.create('bca-heartbeat', { periodInMinutes: 0.5 });
      console.log('[BCA] Heartbeat alarm created');
    } else {
      console.log('[BCA] Heartbeat alarm already exists, next fire:', new Date(alarm.scheduledTime).toISOString());
    }
  } catch (e) {
    console.error('[BCA] Failed to setup heartbeat:', e);
  }
}

// 서비스 워커가 로드될 때 즉시 실행
setupHeartbeat();

/**
 * Keep-alive를 위한 알람 리스너
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'bca-heartbeat') {
    // 서비스 워커 활성 시간 로깅 (디버깅용)
    const uptime = Math.round((Date.now() - SW_START_TIME) / 1000);
    console.debug(`[BCA] Heartbeat - SW uptime: ${uptime}s`);
  }
});

// 단축키 리스너 설정 - 최상위 레벨에서 즉시 실행되어야 함
console.log('[BCA] Setting up command listeners at top level...');
setupCommandListeners();
console.log('[BCA] Command listeners setup completed');

// 초기 상태 로깅
logCommandsStatus();

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
