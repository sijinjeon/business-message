export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    // 네트워크 오류
    if (error.message.includes('fetch')) {
      return new AppError(
        'Network error',
        'NETWORK_ERROR',
        '네트워크 연결을 확인해주세요.'
      )
    }

    // 할당량 초과 (429)
    if (error.message.includes('429') || error.message.toLowerCase().includes('quota exceeded')) {
      return new AppError(
        'Quota Exceeded',
        'RATE_LIMIT_ERROR',
        'AI 서비스 호출 한도를 초과했습니다. 잠시 후(약 1분) 다시 시도하거나, 설정에서 다른 모델 또는 API 키를 확인해주세요.'
      )
    }
    
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      error.message || '알 수 없는 오류가 발생했습니다.'
    )
  }
  
  return new AppError(
    'Unknown error',
    'UNKNOWN_ERROR',
    '알 수 없는 오류가 발생했습니다.'
  )
}
