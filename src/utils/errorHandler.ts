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
    
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      '알 수 없는 오류가 발생했습니다.'
    )
  }
  
  return new AppError(
    'Unknown error',
    'UNKNOWN_ERROR',
    '알 수 없는 오류가 발생했습니다.'
  )
}
