// BCA Content Script Entry Point
import '../styles/global.css';
import { prepareSelectionForReplacement, replaceSelectedText } from './replacer';
import { showToast } from './toast';

console.log('[BCA Content] Script Injected and Ready', window.location.href);

/**
 * Background 및 Popup으로부터의 메시지 수신
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log(`[BCA Content] Received action: ${request.action}`, request);

  switch (request.action) {
    case 'PING':
      console.log('[BCA Content] PING received, responding with pong');
      sendResponse({ success: true, message: 'pong' });
      break;
    case 'GET_SELECTED_TEXT':
      // 로딩 UI와 함께 텍스트 추출
      const selectedText = prepareSelectionForReplacement();
      console.log('[BCA Content] Selected text extracted:', { 
        length: selectedText.length, 
        preview: selectedText.substring(0, 100),
        activeElement: document.activeElement?.tagName,
        activeElementId: document.activeElement?.id
      });
      sendResponse({ text: selectedText });
      break;

    case 'REMOVE_LOADING':
      console.log('[BCA Content] Removing loading indicator');
      const loading = document.getElementById('bca-selection-loading');
      if (loading) loading.remove();
      sendResponse({ success: true });
      break;

    case 'REPLACE_SELECTED_TEXT':
      console.log('[BCA Content] Replacing selected text:', { 
        newTextLength: request.text?.length, 
        append: request.append 
      });
      replaceSelectedText(request.text, request.append);
      sendResponse({ success: true });
      break;

    case 'SHOW_TOAST':
      console.log('[BCA Content] Showing toast:', request.message, request.type);
      showToast(request.message, request.type);
      sendResponse({ success: true });
      break;

    default:
      console.warn('[BCA Content] Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }

  return true; // 비동기 대응
});
