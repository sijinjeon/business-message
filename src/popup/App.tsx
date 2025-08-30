import { useState, useEffect, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ActionBar from './components/ActionBar'
import { AppState } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { convertText } from '@/utils/api'
import { getApiKey, getRemainingUsage, updateDailyUsage } from '@/utils/storage'

const INITIAL_STATE: AppState = {
  inputText: '',
  results: null,
  loadingState: 'idle',
  errorMessage: '',
  remainingUsage: 5
}

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  
  // 초기화
  useEffect(() => {
    initializeApp()
  }, [])
  
  const initializeApp = async () => {
    try {
      // 클립보드에서 텍스트 읽기
      const clipboardText = await readClipboard()
      
      // 남은 사용량 확인
      const remaining = await getRemainingUsage()
      
      setState(prev => ({
        ...prev,
        inputText: clipboardText,
        remainingUsage: remaining
      }))
      
      // 클립보드에 텍스트가 있고 사용량이 남아있으면 자동 변환
      if (clipboardText && remaining > 0) {
        await handleConvert(clipboardText)
      }
    } catch (error) {
      console.error('Initialization error:', error)
    }
  }
  
  const handleConvert = async (text?: string) => {
    const textToConvert = text || state.inputText
    
    if (!textToConvert.trim()) {
      setState(prev => ({
        ...prev,
        errorMessage: '변환할 텍스트를 입력해주세요.'
      }))
      return
    }
    
    if (textToConvert.length > 500) {
      setState(prev => ({
        ...prev,
        errorMessage: '텍스트가 너무 깁니다. 500자 이내로 입력해주세요.'
      }))
      return
    }
    
    if (state.remainingUsage <= 0) {
      setState(prev => ({
        ...prev,
        errorMessage: '오늘의 무료 사용량을 모두 사용하셨습니다.'
      }))
      return
    }
    
    setState(prev => ({
      ...prev,
      loadingState: 'loading',
      errorMessage: '',
      results: null
    }))
    
    try {
      const apiKey = await getApiKey()
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
      }
      
      const results = await convertText(textToConvert, apiKey)
      
      // 사용량 업데이트
      const newCount = await updateDailyUsage()
      const newRemaining = Math.max(0, 5 - newCount)
      
      // 기본값(격식) 자동 복사
      await writeClipboard(results.formal)
      
      setState(prev => ({
        ...prev,
        loadingState: 'success',
        results,
        remainingUsage: newRemaining
      }))
      
    } catch (error) {
      console.error('Conversion error:', error)
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }))
    }
  }
  
  const handleCopy = useCallback(async (text: string) => {
    await writeClipboard(text)
  }, [])
  
  const handleOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])
  
  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      inputText: value,
      errorMessage: ''
    }))
  }, [])
  
  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">정중한 문장 도우미</h1>
      </div>
      
      {/* 입력 영역 */}
      <TextInput
        value={state.inputText}
        onChange={handleInputChange}
        maxLength={500}
        placeholder="변환할 텍스트를 복사하거나, 직접 입력해주세요."
      />
      
      {/* 액션 바 */}
      <ActionBar
        onRegenerate={() => handleConvert()}
        remainingCount={state.remainingUsage}
        isLoading={state.loadingState === 'loading'}
        onOpenSettings={handleOpenSettings}
      />
      
      {/* 에러 메시지 */}
      {state.errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{state.errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* 결과 영역 */}
      <div className="space-y-3">
        {state.loadingState === 'loading' && (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        )}
        
        {state.results && (
          <>
            <ResultCard
              tone="formal"
              text={state.results.formal}
              onCopy={handleCopy}
              isDefaultSelected
            />
            <ResultCard
              tone="general"
              text={state.results.general}
              onCopy={handleCopy}
            />
            <ResultCard
              tone="friendly"
              text={state.results.friendly}
              onCopy={handleCopy}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App