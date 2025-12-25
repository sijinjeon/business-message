// BCA Content Script Entry Point
import '../styles/global.css';
import { prepareSelectionForReplacement, replaceSelectedText } from './replacer';
import { showToast } from './toast';

console.log('BCA Content Script Injected and Ready');

/**
 * Background 및 Popup으로부터의 메시지 수신
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log(`Content Script received action: ${request.action}`);

  switch (request.action) {
    case 'GET_SELECTED_TEXT':
      // 로딩 UI와 함께 텍스트 추출
      sendResponse({ text: prepareSelectionForReplacement() });
      break;

    case 'REMOVE_LOADING':
      const loading = document.getElementById('bca-selection-loading');
      if (loading) loading.remove();
      sendResponse({ success: true });
      break;

    case 'REPLACE_SELECTED_TEXT':
      replaceSelectedText(request.text);
      sendResponse({ success: true });
      break;

    case 'SHOW_TOAST':
      showToast(request.message, request.type);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return true; // 비동기 대응
});
