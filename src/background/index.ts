// BCA Background Service Worker
import { setupCommandListeners } from './commands';

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
 * 런타임 메시지 리스너 (서비스 워커 상태 확인)
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // 서비스 워커 상태 확인을 위한 PING
  if (request.action === 'PING_BKG') {
    sendResponse({ status: 'active', timestamp: Date.now() });
    return true;
  }

  return false;
});
