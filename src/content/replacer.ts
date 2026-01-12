// BCA Content Replacer (Selection manipulation)

/**
 * 현재 선택된 텍스트 추출 및 로딩 표시 준비
 * - input/textarea: selectionStart/End를 사용하여 직접 추출
 * - contentEditable/일반 DOM: window.getSelection() 사용
 */
export function prepareSelectionForReplacement(): string {
  const activeElement = document.activeElement;
  
  console.log('[BCA Replacer] prepareSelectionForReplacement called', {
    activeElementTag: activeElement?.tagName,
    activeElementType: (activeElement as HTMLInputElement)?.type,
    activeElementId: activeElement?.id,
    activeElementClass: activeElement?.className
  });

  // 1. 입력 폼(input/textarea)인 경우 selectionStart/End로 직접 추출
  if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
    const start = activeElement.selectionStart ?? 0;
    const end = activeElement.selectionEnd ?? 0;
    const selectedText = activeElement.value.substring(start, end);
    
    console.log('[BCA Replacer] Input/Textarea selection:', {
      start,
      end,
      selectedLength: selectedText.length,
      selectedPreview: selectedText.substring(0, 50)
    });
    
    // 선택된 텍스트가 있으면 반환
    if (selectedText) {
      return selectedText;
    }
  }

  // 2. contentEditable 또는 일반 DOM 선택의 경우 window.getSelection() 사용
  const selection = window.getSelection();
  const text = selection?.toString() || '';
  
  console.log('[BCA Replacer] window.getSelection result:', {
    hasSelection: !!selection,
    rangeCount: selection?.rangeCount,
    textLength: text.length,
    textPreview: text.substring(0, 50)
  });
  
  if (!text || !selection || selection.rangeCount === 0) return text;

  // contentEditable인 경우 로딩 스피너 삽입
  const isContentEditable = activeElement instanceof HTMLElement && activeElement.isContentEditable;
  
  // 일반 DOM인 경우 선택 영역 끝에 로딩 스피너 삽입
  if (!isContentEditable) {
    try {
      const range = selection.getRangeAt(0);
      const container = document.createElement('span');
      container.id = 'bca-selection-loading';
      container.className = 'bca-loading-container';
      
      const spinner = document.createElement('span');
      spinner.className = 'bca-spinner';
      
      const textNode = document.createElement('span');
      textNode.innerText = ' 처리 중...';
      textNode.style.marginLeft = '4px';
      textNode.style.fontSize = '1.0em';
      textNode.style.color = '#6b7280';
      
      container.appendChild(spinner);
      container.appendChild(textNode);
      
      // 선택 영역의 끝에 삽입 (collapse to end)
      const cloneRange = range.cloneRange();
      cloneRange.collapse(false);
      cloneRange.insertNode(container);
    } catch (e) {
      console.error('[BCA Replacer] Error inserting loading indicator:', e);
    }
  }

  return text;
}

/**
 * 선택된 텍스트를 새로운 텍스트로 대체하거나 아래에 추가
 * @param newText 변환/번역된 텍스트
 * @param append 원본을 유지하고 아래에 추가할지 여부
 */
export function replaceSelectedText(newText: string, append: boolean = false) {
  console.log('[BCA Replacer] replaceSelectedText called:', {
    newTextLength: newText?.length,
    newTextPreview: newText?.substring(0, 50),
    append
  });

  // 로딩 인디케이터 제거
  const loading = document.getElementById('bca-selection-loading');
  if (loading) {
    loading.remove();
  }

  const activeElement = document.activeElement;
  
  console.log('[BCA Replacer] Active element info:', {
    tag: activeElement?.tagName,
    type: (activeElement as HTMLInputElement)?.type,
    isContentEditable: activeElement instanceof HTMLElement && activeElement.isContentEditable
  });

  // 1. 입력 폼(Textarea, Input) 내 선택 영역 처리
  if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
    const start = activeElement.selectionStart ?? 0;
    const end = activeElement.selectionEnd ?? 0;
    const val = activeElement.value;
    
    console.log('[BCA Replacer] Input/Textarea replacement:', {
      start,
      end,
      originalLength: val.length,
      selectedText: val.substring(start, end)
    });
    
    if (append) {
      // 원문 유지 + 아래에 추가
      const separator = val.includes('\n') ? '\n' : ' ';
      const appendText = `${separator}[번역] ${newText}`;
      activeElement.value = val.slice(0, end) + appendText + val.slice(end);
      activeElement.selectionStart = activeElement.selectionEnd = end + appendText.length;
    } else {
      // 완전 대체
      activeElement.value = val.slice(0, start) + newText + val.slice(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;
    }
    
    // input 이벤트 발생시켜 React 등 프레임워크가 변경을 감지하도록 함
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('[BCA Replacer] Input/Textarea replacement completed');
    return;
  }

  // 2. 일반 DOM 또는 contentEditable 처리
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn('[BCA Replacer] No selection available for DOM replacement');
    return;
  }

  const range = selection.getRangeAt(0);

  // 2. 일반 DOM 요소 (contentEditable 포함) 처리
  if (append) {
    // 원문 유지하고 아래에 추가
    range.collapse(false); // 선택 영역 끝으로 이동

    const container = document.createElement('div');
    container.className = 'bca-translation-block';
    // 인라인 스타일로 기본 디자인 적용 (global.css 영향 최소화 및 확실한 구분)
    container.style.display = 'inline-block';
    container.style.maxWidth = '100%';
    container.style.verticalAlign = 'top';
    container.style.boxSizing = 'border-box';
    container.style.color = '#2563eb'; // blue-600
    container.style.fontSize = '0.95em';
    container.style.marginTop = '8px';
    container.style.marginBottom = '8px';
    container.style.padding = '8px 12px';
    container.style.borderLeft = '3px solid #3b82f6';
    container.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    container.style.whiteSpace = 'pre-wrap';
    container.style.borderRadius = '4px';
    container.style.lineHeight = '1.6';
    container.style.fontFamily = 'sans-serif';
    container.style.textAlign = 'left';
    
    container.textContent = newText;
    
    try {
      range.insertNode(container);
      // 삽입 후 선택 해제
      selection.removeAllRanges();
    } catch (e) {
      console.error('Error inserting translation block:', e);
      // 폴백: 단순 텍스트 삽입
      range.insertNode(document.createTextNode(` [번역: ${newText}]`));
    }
  } else {
    // 기존 로직: 대체 (document.execCommand 사용)
    try {
      const success = document.execCommand('insertText', false, newText);
      if (!success) {
        // execCommand 실패 시 Range 수동 조작
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
      }
    } catch (e) {
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));
    }
  }
}

