import { useState, useEffect } from 'react'
import { AlertCircle, Sparkles, Command, ShieldCheck, Languages, MessageSquare, Loader2, Settings } from 'lucide-react'
import { Select, SelectItem } from '@/components/ui/select'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'

import { AIApiResponse, TargetLanguage } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { useSettings } from '@/hooks/useSettings'
import { useAICall } from '@/hooks/useAICall'
import { logUsage } from '@/utils/storage'

function App() {
  const { settings, apiKeys, lastUsedTab, isLoading: isSettingsLoading, updateLastUsedTab } = useSettings()
  const { execute: runAI, loadingState, error: aiError } = useAICall()

  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState<Partial<AIApiResponse> | null>(null)
  const [convertingTones, setConvertingTones] = useState<Record<string, boolean>>({})
  const [translationResult, setTranslationResult] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tone' | 'translation'>('tone')
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('ko')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    if (settings) {
      setTargetLanguage(settings.translation.defaultTargetLanguage)
      setActiveTab(lastUsedTab)
    }
  }, [settings?.translation.defaultTargetLanguage, lastUsedTab])

  useEffect(() => {
    const handleAutoProcess = async () => {
      // 설정이 로드될 때까지 대기
      if (isSettingsLoading || !settings) return;

      const data = await chrome.storage.local.get(['lastCommand', 'commandTimestamp']);
      const now = Date.now();
      
      // 5초 이내의 명령어만 유효한 것으로 처리
      if (data.lastCommand && data.commandTimestamp && (now - data.commandTimestamp < 5000)) {
        console.log(`[BCA] Auto-processing command: ${data.lastCommand}`);
        const text = await readClipboard();
        if (text) {
          setInputText(text);
          
          if (data.lastCommand === 'translation') {
            setActiveTab('translation');
            await updateLastUsedTab('translation');
            await handleProcess(text, 'translation');
          } else if (data.lastCommand === 'tone-conversion' || data.lastCommand === '_execute_action') {
            setActiveTab('tone');
            await updateLastUsedTab('tone');
            await handleProcess(text, 'tone');
          }
        }
        await chrome.storage.local.remove(['lastCommand', 'commandTimestamp']);
      } else {
        // 자동 실행 조건이 아닐 때만 클립보드 내용을 입력창에 채움 (이미 입력된 내용이 없을 때)
        if (!inputText) {
          const text = await readClipboard();
          if (text) setInputText(text);
        }
      }
    };

    handleAutoProcess();
  }, [isSettingsLoading, settings]);

  const handleProcess = async (textOverride?: string, tabOverride?: 'tone' | 'translation') => {
    const text = textOverride || inputText
    const tab = tabOverride || activeTab

    if (!text.trim() || !settings) {
      showStatusMessage('내용을 입력해주세요.', 'error')
      return
    }

    const apiKey = apiKeys[settings.selectedProvider]
    if (!apiKey) {
      showStatusMessage(`${settings.selectedProvider} API 키가 설정되지 않았습니다.`, 'error')
      return
    }

    const response = await runAI(text, tab === 'tone' ? 'tone-conversion' : 'translation', {
      provider: settings.selectedProvider,
      model: settings.providerModels[settings.selectedProvider],
      apiKey,
      targetLanguage: tab === 'translation' ? targetLanguage : undefined,
      tone: tab === 'tone' ? settings.autoCopyTone : undefined
    })

    if (response) {
      if (tab === 'tone') {
        const res = response as AIApiResponse
        setResults(res)
        if (settings.autoCopyEnabled && res[settings.autoCopyTone]) {
          await writeClipboard(res[settings.autoCopyTone]!)
          showStatusMessage('✨ 변환 및 복사 완료', 'success')
        }
      } else {
        setTranslationResult(response as string)
        showStatusMessage('✨ 번역 완료', 'success')
      }
      
      await logUsage({
        provider: settings.selectedProvider,
        model: settings.providerModels[settings.selectedProvider],
        task: tab === 'tone' ? 'tone-conversion' : 'translation',
        inputTokens: Math.ceil(text.length * 0.75),
        outputTokens: Math.ceil((typeof response === 'string' ? response.length : JSON.stringify(response).length) * 0.75)
      })
    }
  }

  const handleSingleToneConversion = async (tone: 'formal' | 'general' | 'friendly') => {
    if (!inputText.trim() || !settings) return;

    const apiKey = apiKeys[settings.selectedProvider]
    if (!apiKey) {
      showStatusMessage(`${settings.selectedProvider} API 키가 설정되지 않았습니다.`, 'error')
      return
    }

    setConvertingTones(prev => ({ ...prev, [tone]: true }))
    
    try {
      const response = await runAI(inputText, 'tone-conversion', {
        provider: settings.selectedProvider,
        model: settings.providerModels[settings.selectedProvider],
        apiKey,
        tone
      })

      if (response) {
        const res = response as AIApiResponse
        setResults(prev => ({ ...prev, ...res }))
        showStatusMessage(`✨ ${tone === 'formal' ? '비즈니스' : tone === 'general' ? '사내' : '캐주얼'} 스타일 변환 완료`, 'success')
        
        await logUsage({
          provider: settings.selectedProvider,
          model: settings.providerModels[settings.selectedProvider],
          task: 'tone-conversion',
          inputTokens: Math.ceil(inputText.length * 0.75),
          outputTokens: Math.ceil(JSON.stringify(response).length * 0.75)
        })
      }
    } finally {
      setConvertingTones(prev => ({ ...prev, [tone]: false }))
    }
  }

  const showStatusMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg); setMessageType(type)
    setTimeout(() => { setMessage(''); setMessageType('') }, 2000)
  }

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/index.html', '_blank');
    }
  }

  if (isSettingsLoading) return <div className="w-[800px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>

  return (
    <div className="w-[800px] h-[600px] bg-white relative flex flex-col overflow-hidden selection:bg-zinc-900/10">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Command className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-tight text-zinc-900 leading-none">BCA Assistant</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className={`px-3 py-1.5 rounded-full text-[12px] font-bold animate-in fade-in slide-in-from-right-2 border flex items-center gap-2 ${
              messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {messageType === 'success' ? <Sparkles className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {message}
            </div>
          )}
          <button 
            onClick={handleOpenSettings}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Input */}
        <section className="w-[340px] border-r border-zinc-100 flex flex-col p-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              메시지 입력
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <TextInput 
              value={inputText} 
              onChange={setInputText} 
              maxLength={5000} 
              placeholder="다듬거나 번역할 메시지를 입력하세요..." 
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={async () => {
                const text = await readClipboard()
                if (text) setInputText(text)
              }}
              className="w-full py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              클립보드 붙여넣기
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setActiveTab('tone'); handleProcess(inputText, 'tone'); }}
                disabled={loadingState === 'loading'}
                className={`py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-1 border ${
                  activeTab === 'tone' 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                톤 변환
              </button>
              <button
                onClick={() => { setActiveTab('translation'); handleProcess(inputText, 'translation'); }}
                disabled={loadingState === 'loading'}
                className={`py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-1 border ${
                  activeTab === 'translation' 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Languages className="w-4 h-4" />
                전문 번역
              </button>
            </div>
            
            {activeTab === 'translation' && (
              <div className="pt-2">
                <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
                  <SelectItem value="ko">한국어로 번역</SelectItem>
                  <SelectItem value="en">영어로 번역</SelectItem>
                  <SelectItem value="ja">일본어로 번역</SelectItem>
                  <SelectItem value="zh-CN">중국어로 번역</SelectItem>
                </Select>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Result */}
        <section className="flex-1 bg-zinc-50/30 flex flex-col overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-zinc-100 bg-white/50 backdrop-blur-sm">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              {activeTab === 'tone' ? '톤 변환 결과' : '번역 결과'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col">
            {aiError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 mb-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[14px] font-medium">{aiError}</p>
              </div>
            )}

            <div className="h-full">
              {loadingState === 'loading' ? (
                <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                  <div className="bca-gradient-spinner mb-4" />
                  <p className="text-[13px] font-bold text-zinc-400 animate-pulse">AI가 응답을 생성하고 있습니다...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'tone' && results && (
                    <div className="space-y-3">
                      <ResultCard 
                        tone="formal" 
                        text={results.formal} 
                        onCopy={writeClipboard} 
                        isDefaultSelected={settings?.autoCopyTone === 'formal'} 
                        onConvert={handleSingleToneConversion}
                        isLoading={convertingTones['formal']}
                      />
                      <ResultCard 
                        tone="general" 
                        text={results.general} 
                        onCopy={writeClipboard} 
                        isDefaultSelected={settings?.autoCopyTone === 'general'} 
                        onConvert={handleSingleToneConversion}
                        isLoading={convertingTones['general']}
                      />
                      <ResultCard 
                        tone="friendly" 
                        text={results.friendly} 
                        onCopy={writeClipboard} 
                        isDefaultSelected={settings?.autoCopyTone === 'friendly'} 
                        onConvert={handleSingleToneConversion}
                        isLoading={convertingTones['friendly']}
                      />
                    </div>
                  )}

                  {activeTab === 'translation' && translationResult && (
                    <div className="p-6 rounded-2xl border border-zinc-100 bg-white space-y-4 shadow-sm">
                      <p className="font-sans text-[15px] leading-relaxed text-zinc-900 whitespace-pre-wrap">{translationResult}</p>
                      <div className="flex justify-end border-t border-zinc-50 pt-4">
                        <button 
                          onClick={() => { writeClipboard(translationResult!); showStatusMessage('✨ 복사 완료', 'success') }} 
                          className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[12px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          클립보드에 복사
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {loadingState === 'idle' && !results && !translationResult && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-20">
                  <Sparkles className="w-10 h-10 mb-4 opacity-10" />
                  <p className="text-[13px] font-medium">변환 또는 번역을 선택해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-3 border-t border-zinc-50 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Secured by {settings?.selectedProvider.toUpperCase() || 'AI'}
        </div>
        <div className="flex items-center gap-4">
          <span>v2.5.1</span>
        </div>
      </footer>
    </div>
  )
}

export default App
