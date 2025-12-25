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
        message: 'Please enter text to convert.',
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
      let successMessage = '✅ Transformation completed!'

      if (autoCopyEnabled) {
        const textToCopy = results[autoCopyTone]
        await writeClipboard(textToCopy)
        const toneNames = {
          formal: 'Business Email',
          general: 'Slack/Teams',
          friendly: 'Casual Chat'
        }
        successMessage = `✅ ${toneNames[autoCopyTone]} result copied to clipboard!`
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
        message: 'Failed to read clipboard.',
        messageType: 'error'
      }))
    }
  }, [])

  return (
    <div className="w-[380px] min-h-[500px] p-5 space-y-5 bg-background selection:bg-primary/20">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b pb-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">Polite Assistant</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Business Message Helper</p>
          </div>
        </div>
      </div>

      {/* AI Provider Selection */}
      <div className="space-y-2.5 bg-muted/30 p-3 rounded-xl border border-primary/5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">AI Provider</label>
        <Select
          value={selectedProvider}
          onValueChange={handleProviderChange}
        >
          <SelectItem value="gemini" className="text-xs">
            {AI_PROVIDERS.gemini.name}
          </SelectItem>
          <SelectItem value="chatgpt" className="text-xs">
            {AI_PROVIDERS.chatgpt.name}
          </SelectItem>
          <SelectItem value="claude" className="text-xs">
            {AI_PROVIDERS.claude.name}
          </SelectItem>
        </Select>
      </div>

      {/* Input Area */}
      <TextInput
        value={state.inputText}
        onChange={handleInputChange}
        maxLength={0}
        placeholder="Paste your text or type here..."
      />

      {/* Actions */}
      <ActionBar
        onRegenerate={() => handleConvert()}
        onReadClipboard={handleReadClipboard}
        isLoading={state.loadingState === 'loading'}
        onOpenSettings={handleOpenSettings}
      />

      {/* Status Messages */}
      {state.message && (
        <Alert variant={state.messageType === 'error' ? 'destructive' : 'default'} className="rounded-xl border-dashed">
          <AlertDescription className="text-[11px] font-medium">{state.message}</AlertDescription>
        </Alert>
      )}

      {/* 결과 영역 */}
      <div className="space-y-4 pt-2">
        {state.loadingState === 'loading' && (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
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