import { useState, useEffect, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectItem } from '@/components/ui/select'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ActionBar from './components/ActionBar'
import { AppState, AIProvider } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { convertText, AI_PROVIDERS } from '@/utils/api'
import { 
  getCurrentApiKey, 
  getAutoCopyEnabled, 
  getAutoCopyTone,
  getSelectedProvider,
  setSelectedProvider
} from '@/utils/storage'

const INITIAL_STATE: AppState = {
  inputText: '',
  results: null,
  loadingState: 'idle',
  message: '',
  messageType: '',
  remainingUsage: 0
}

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>('gemini')
  
  // 초기화
  useEffect(() => {
    initializeApp()
  }, [])
  
  const initializeApp = async () => {
    try {
      // 클립보드에서 텍스트 읽기
      const clipboardText = await readClipboard()
      
      // 선택된 AI 제공업체 로드
      const provider = await getSelectedProvider()
      
      setState(prev => ({
        ...prev,
        inputText: clipboardText,
        remainingUsage: 0
      }))
      
      setSelectedProviderState(provider)
      
      // 클립보드에 텍스트가 있으면 자동 변환
      if (clipboardText) {
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
        message: '변환할 텍스트를 입력해주세요.',
        messageType: 'error'
      }))
      return
    }
    

    
    setState(prev => ({
      ...prev,
      loadingState: 'loading',
      message: '',
      messageType: '',
      results: null
    }))
    
    try {
      const apiKey = await getCurrentApiKey()
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
      }
      
      const results = await convertText(textToConvert, selectedProvider, apiKey)
      
      // 자동 복사 설정 확인 후 복사
      const autoCopyEnabled = await getAutoCopyEnabled()
      const autoCopyTone = await getAutoCopyTone()
      let successMessage = '✅ 변환이 완료되었습니다!'
      
      if (autoCopyEnabled) {
        const textToCopy = results[autoCopyTone]
        await writeClipboard(textToCopy)
        const toneNames = {
          formal: '비즈니스 이메일',
          general: '사내 메신저', 
          friendly: '캐주얼 채팅'
        }
        successMessage = `✅ ${toneNames[autoCopyTone]} 결과가 클립보드에 복사되었습니다!`
      }
      
      setState(prev => ({
        ...prev,
        loadingState: 'success',
        results,
        remainingUsage: 0,
        message: successMessage,
        messageType: 'success'
      }))
      
      // 성공 메시지를 3초 후 자동으로 제거
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          message: '',
          messageType: ''
        }))
      }, 3000)
      
    } catch (error) {
      console.error('Conversion error:', error)
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        messageType: 'error'
      }))
    }
  }
  
  const handleCopy = useCallback(async (text: string) => {
    await writeClipboard(text)
  }, [])
  
  const handleOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])
  
  const handleProviderChange = useCallback(async (provider: string) => {
    const newProvider = provider as AIProvider
    setSelectedProviderState(newProvider)
    try {
      await setSelectedProvider(newProvider)
    } catch (error) {
      console.error('Failed to save provider setting:', error)
    }
  }, [])
  
  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      inputText: value,
      message: '',
      messageType: ''
    }))
  }, [])
  
  const handleReadClipboard = useCallback(async () => {
    try {
      const clipboardText = await readClipboard()
      
      setState(prev => ({
        ...prev,
        inputText: clipboardText,
        message: '',
        messageType: ''
      }))
      
      // 클립보드에 텍스트가 있으면 자동 변환
      if (clipboardText) {
        await handleConvert(clipboardText)
      }
    } catch (error) {
      console.error('Clipboard read error:', error)
      setState(prev => ({
        ...prev,
        message: '클립보드 읽기에 실패했습니다.',
        messageType: 'error'
      }))
    }
  }, [])
  
  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">정중한 문장 도우미</h1>
      </div>
      
      {/* AI 제공업체 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">AI 제공업체</label>
        <Select
          value={selectedProvider}
          onValueChange={handleProviderChange}
        >
          <SelectItem value="gemini">
            {AI_PROVIDERS.gemini.name}
          </SelectItem>
          <SelectItem value="chatgpt">
            {AI_PROVIDERS.chatgpt.name}
          </SelectItem>
          <SelectItem value="claude">
            {AI_PROVIDERS.claude.name}
          </SelectItem>
        </Select>
      </div>
      
      {/* 입력 영역 */}
      <TextInput
        value={state.inputText}
        onChange={handleInputChange}
        maxLength={0}
        placeholder="변환할 텍스트를 복사하거나, 직접 입력해주세요."
      />
      
      {/* 액션 바 */}
      <ActionBar
        onRegenerate={() => handleConvert()}
        onReadClipboard={handleReadClipboard}
        isLoading={state.loadingState === 'loading'}
        onOpenSettings={handleOpenSettings}
      />
      
      {/* 메시지 */}
      {state.message && (
        <Alert variant={state.messageType === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{state.message}</AlertDescription>
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