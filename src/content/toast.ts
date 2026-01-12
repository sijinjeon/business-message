// BCA Toast Notification System (DOM-based)

/**
 * 토스트 알림 표시
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // 1. 기존 토스트 제거 (중복 방지)
  const existingToast = document.getElementById('bca-toast-container');
  if (existingToast) existingToast.remove();

  // 2. 컨테이너 생성
  const container = document.createElement('div');
  container.id = 'bca-toast-container';
  
  // 3. 스타일 설정
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    maxWidth: '400px',
    minWidth: '200px',
    padding: '14px 24px',
    borderRadius: '14px',
    backgroundColor: type === 'error' ? '#ef4444' : '#18181b',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    wordWrap: 'break-word',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: '99999999',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: '0',
    transform: 'translateY(20px)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  // 4. 내용 구성
  const icon = type === 'error' ? '❌' : (type === 'success' ? '✅' : 'ℹ️');
  container.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  // 5. 문서에 삽입
  document.body.appendChild(container);

  // 6. 애니메이션 효과 (입력)
  requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });

  // 7. 자동 제거 (3초 후)
  setTimeout(() => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    setTimeout(() => container.remove(), 300);
  }, 3000);
}

