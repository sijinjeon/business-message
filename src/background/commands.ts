// BCA Background Command Handler
import { translateText } from '../utils/translation';
import { getStorageData, logUsage } from '../utils/storage';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { decryptData } from '../utils/crypto';
import { AIApiResponse } from '../types';

/**
 * 전역 단축키 이벤트 리스너 설정
 */
export function setupCommandListeners() {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log(`[BCA] Command received: ${command}`);

    try {
      if (command === 'instant-translation') {
        await handleInstantTranslation();
      } else if (command === 'instant-tone-conversion') {
        await handleInstantToneConversion();
      } else if (command === '_execute_action' || command === 'tone-conversion') {
        // _execute_action은 팝업을 열지만, 배경에서도 처리가 필요한 경우
        console.log('[BCA] Action executed, preparing popup data');
        await chrome.storage.local.set({ 
          lastCommand: 'tone-conversion', 
          commandTimestamp: Date.now() 
        });
        
        // tone-conversion이라는 이름으로 수동 호출된 경우 (직접 설정한 단축키 등)
        if (command === 'tone-conversion') {
          try {
            if (chrome.action && typeof chrome.action.openPopup === 'function') {
              await chrome.action.openPopup();
            }
          } catch (e) {
            console.warn('[BCA] openPopup failed, but storage is set');
          }
        }
      }
    } catch (error) {
      console.error(`[BCA] Error handling command ${command}:`, error);
    }
  });
}

/**
 * 안전한 메시지 전송 유틸리티
 */
/**
 * 컨텐츠 스크립트가 로드되었는지 확인하고, 필요시 주입 시도
 */
async function ensureContentScriptReady(tabId: number): Promise<boolean> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'PING' });
    return response?.message === 'pong';
  } catch (e) {
    console.log(`[BCA] Content script not ready on tab ${tabId}, attempting injection...`);
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/content/index.ts']
      });
      // 주입 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (injectError) {
      console.error('[BCA] Failed to inject content script:', injectError);
      return false;
    }
  }
}

/**
 * 안전한 메시지 전송 유틸리티
 */
async function safeSendMessage(tabId: number, message: any) {
  try {
    // 먼저 PING으로 확인
    const ready = await ensureContentScriptReady(tabId);
    if (!ready) {
      console.warn(`[BCA] Content script not ready on tab ${tabId}`);
      throw new Error('Content script not ready');
    }

    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.warn(`[BCA] Failed to send message to tab ${tabId}:`, error);
    
    if (message.action === 'SHOW_TOAST') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: message.type === 'error' ? 'BCA 오류' : 'BCA 알림',
        message: message.message
      });
    }
    
    return null;
  }
}

/**
 * 즉시 톤 변환 처리
 */
async function handleInstantToneConversion() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    console.warn('[BCA] No active tab found for instant conversion');
    return;
  }

  // 브라우저 내부 페이지 등 스크립트 실행이 불가능한 페이지인지 확인
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
    console.warn('[BCA] Cannot run on internal browser pages');
    return;
  }

  try {
    const response = await safeSendMessage(tab.id, { action: 'GET_SELECTED_TEXT' });
    
    // 메시지 전송 실패 (컨텐츠 스크립트 미작동)
    if (response === null) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'BCA 알림',
        message: '현재 페이지에서 기능을 실행할 수 없습니다. 페이지를 새로고침하거나 다른 페이지에서 시도해주세요.'
      });
      return;
    }

    const text = response.text;
    if (!text || text.trim() === '') {
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: '변환할 텍스트를 선택해주세요.',
        type: 'info'
      });
      return;
    }

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
    const style = settings.instantToneStyle || 'formal';
    
    const result = await AIOrchestrator.execute(text, 'tone-conversion', {
      provider,
      model,
      apiKey,
      tone: style
    }) as AIApiResponse;

    const convertedText = result[style];
    if (!convertedText) {
      throw new Error('변환된 텍스트를 생성하지 못했습니다.');
    }

    await safeSendMessage(tab.id, {
      action: 'REPLACE_SELECTED_TEXT',
      text: convertedText
    });
    
    await logUsage({
      provider,
      model,
      task: 'tone-conversion',
      inputTokens: Math.ceil(text.length * 0.75),
      outputTokens: Math.ceil(convertedText.length * 0.75)
    });

  } catch (error: any) {
    console.error('[BCA] Instant Tone Conversion Error:', error);
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
  if (!tab?.id) {
    console.warn('[BCA] No active tab found for instant translation');
    return;
  }

  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
    return;
  }

  try {
    const response = await safeSendMessage(tab.id, { action: 'GET_SELECTED_TEXT' });
    
    if (response === null) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'BCA 알림',
        message: '현재 페이지에서 기능을 실행할 수 없습니다. 페이지를 새로고침하거나 다른 페이지에서 시도해주세요.'
      });
      return;
    }

    const text = response.text;
    if (!text || text.trim() === '') {
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: '번역할 텍스트를 선택해주세요.',
        type: 'info'
      });
      return;
    }

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
        text: result.translatedText,
        append: true
      });
      
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
  } catch (error: any) {
    console.error('[BCA] Instant Translation Error:', error);
    if (tab?.id) {
      await safeSendMessage(tab.id, { action: 'REMOVE_LOADING' });
      await safeSendMessage(tab.id, {
        action: 'SHOW_TOAST',
        message: error.message || '번역 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  }
}
