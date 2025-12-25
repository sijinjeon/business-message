// BCA Background Command Handler
import { translateText } from '../utils/translation';
import { getStorageData, logUsage } from '../utils/storage';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { decryptData } from '../utils/crypto';
import { AIApiResponse } from '../types';

/**
 * 전역 단축키 이벤트 리스너
 */
export function setupCommandListeners() {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command received: ${command}`);

    if (command === 'instant-translation') {
      await handleInstantTranslation();
    } else if (command === 'instant-tone-conversion') {
      await handleInstantToneConversion();
    } else if (command === 'tone-conversion') {
      // 클립보드 기반 톤 변환 팝업 열기
      await chrome.storage.local.set({ lastCommand: 'tone-conversion', commandTimestamp: Date.now() });
      await chrome.action.openPopup();
    } else if (command === '_execute_action') {
      // 클립보드 기반 번역 팝업 열기 (기본 액션)
      await chrome.storage.local.set({ lastCommand: '_execute_action', commandTimestamp: Date.now() });
      // _execute_action은 자동으로 팝업을 열지만, 명시적으로 플래그를 심어줍니다.
    }
  });
}

/**
 * 액션 아이콘 클릭 핸들러 (아이콘을 직접 클릭했을 때도 번역 탭으로 유도하고 싶다면 추가)
 */
chrome.action.onClicked.addListener(async () => {
  await chrome.storage.local.set({ lastCommand: '_execute_action', commandTimestamp: Date.now() });
  await chrome.action.openPopup();
});

/**
 * 안전한 메시지 전송 유틸리티
 */
async function safeSendMessage(tabId: number, message: any) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.warn(`[BCA] Failed to send message to tab ${tabId}:`, error);
    return null;
  }
}

/**
 * 즉시 톤 변환 처리
 */
async function handleInstantToneConversion() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await safeSendMessage(tab.id, { action: 'GET_SELECTED_TEXT' });
    const text = response?.text;
    if (!text) return;

    const data = await getStorageData();
    const { settings, apiKeys } = data;
    const provider = settings.selectedProvider;
    const model = settings.providerModels[provider];
    const encryptedKey = apiKeys[provider];

    if (!encryptedKey) {
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: `${provider} API 키가 설정되지 않았습니다.`,
        type: 'error'
      });
      return;
    }

    const apiKey = await decryptData(encryptedKey);
    const result = await AIOrchestrator.execute(text, 'tone-conversion', {
      provider,
      model,
      apiKey
    }) as AIApiResponse;

    // 설정된 톤 스타일 가져오기
    const style = settings.instantToneStyle || 'formal';
    const convertedText = result[style];

    await safeSendMessage(tab.id, {
      action: 'REPLACE_SELECTED_TEXT',
      text: convertedText
    });
    
    // 상세 로그 기록
    await logUsage({
      provider,
      model,
      task: 'tone-conversion',
      inputTokens: Math.ceil(text.length * 0.75),
      outputTokens: Math.ceil(convertedText.length * 0.75)
    });

  } catch (error: any) {
    console.error('Instant Tone Conversion Error:', error);
    if (tab?.id) {
      await safeSendMessage(tab.id, { action: 'REMOVE_LOADING' });
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: error.message || '변환에 실패했습니다.',
        type: 'error'
      });
    }
  }
}

/**
 * 즉시 번역 (선택 영역) 처리
 */
async function handleInstantTranslation() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await safeSendMessage(tab.id, { action: 'GET_SELECTED_TEXT' });
    const text = response?.text;
    if (!text) return;

    const data = await getStorageData();
    const { settings, apiKeys } = data;

    const result = await translateText(
      text,
      settings.translation.defaultTargetLanguage,
      settings,
      apiKeys
    );

    if (result.success) {
      await safeSendMessage(tab.id, {
        action: 'REPLACE_SELECTED_TEXT',
        text: result.translatedText
      });
      
      // 상세 로그 기록
      await logUsage({
        provider: settings.selectedProvider,
        model: settings.providerModels[settings.selectedProvider],
        task: 'translation',
        inputTokens: Math.ceil(text.length * 0.75),
        outputTokens: Math.ceil(result.translatedText.length * 0.75)
      });
    } else {
      await safeSendMessage(tab.id, { action: 'REMOVE_LOADING' });
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: result.error || '번역에 실패했습니다.',
        type: 'error'
      });
    }
  } catch (error) {
    console.error('Instant Translation Error:', error);
    if (tab?.id) {
      await safeSendMessage(tab.id, { action: 'REMOVE_LOADING' });
    }
  }
}
