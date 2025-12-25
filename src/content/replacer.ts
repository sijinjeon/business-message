// BCA Content Replacer (Selection manipulation)

/**
 * 현재 선택된 텍스트 추출 및 로딩 표시 준비
 */
export function prepareSelectionForReplacement(): string {
  const selection = window.getSelection();
  const text = selection?.toString() || '';
  
  if (!text || !selection || selection.rangeCount === 0) return text;

  // 입력 폼인 경우 로딩 표시가 어려우므로 텍스트만 반환
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
    return text;
  }

  // 일반 DOM인 경우 선택 영역 끝에 로딩 스피너 삽입
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
    console.error('Error inserting loading indicator:', e);
  }

  return text;
}

/**
 * 선택된 텍스트를 새로운 텍스트로 대체
 */
export function replaceSelectedText(newText: string) {
  // 로딩 인디케이터 제거
  const loading = document.getElementById('bca-selection-loading');
  if (loading) {
    loading.remove();
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  
  // 1. 입력 폼(Textarea, Input) 내 선택 영역 처리
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
    const start = activeElement.selectionStart || 0;
    const end = activeElement.selectionEnd || 0;
    const val = activeElement.value;
    
    activeElement.value = val.slice(0, start) + newText + val.slice(end);
    // 커서 위치 조정
    activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;
    return;
  }

  // 2. 일반 DOM 요소 (contentEditable 포함) 처리
  // document.execCommand('insertText')는 브라우저의 Undo/Redo 기록을 유지하므로 권장됨
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

