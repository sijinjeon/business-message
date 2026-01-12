import { useState, useEffect } from 'react'
import { AlertCircle, Sparkles, Command, ShieldCheck, Languages, Loader2, Settings, X, Clipboard, Play, ArrowRight } from 'lucide-react'
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
  const [sourceLanguage, setSourceLanguage] = useState<'auto' | TargetLanguage>('auto')
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
      if (isSettingsLoading || !settings) return;

      const data = await chrome.storage.local.get(['lastCommand', 'commandTimestamp']);
      const now = Date.now();
      
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
    setMessage(msg);
    setMessageType(type)

    if (type === 'success') {
      setTimeout(() => {
        setMessage('');
        setMessageType('')
      }, 2000)
    }
  }

  const dismissMessage = () => {
    setMessage('');
    setMessageType('');
  }

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/index.html', '_blank');
    }
  }

  const handlePasteFromClipboard = async () => {
    const text = await readClipboard()
    if (text) setInputText(text)
  }

  if (isSettingsLoading) return <div className="w-[800px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>

  return (
    <div className="w-[800px] h-[600px] bg-white relative flex flex-col overflow-hidden selection:bg-zinc-900/10">
      {/* Compact Header */}
      <header className="shrink-0 border-b border-zinc-100">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Command className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-[13px] font-bold tracking-tight text-zinc-900">BCA Assistant</h1>
          </div>

          <div className="flex items-center gap-2">
            {message && (
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold animate-in fade-in slide-in-from-right-2 border flex items-center gap-1.5 max-w-[250px] ${
                messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {messageType === 'success' ? <Sparkles className="w-2.5 h-2.5 shrink-0" /> : <AlertCircle className="w-2.5 h-2.5 shrink-0" />}
                <span className="truncate">{message}</span>
                {messageType === 'error' && (
                  <button onClick={dismissMessage} className="ml-0.5 hover:opacity-70 shrink-0">
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
            <button 
              onClick={handleOpenSettings}
              className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Control Bar - All controls in one row */}
      <div className="shrink-0 px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          {/* Tab Buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={() => { setActiveTab('tone'); updateLastUsedTab('tone'); }}
              disabled={loadingState === 'loading'}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tone'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              톤 변환
            </button>
            <button
              onClick={() => { setActiveTab('translation'); updateLastUsedTab('translation'); }}
              disabled={loadingState === 'loading'}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'translation'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              번역
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-200" />

          {/* Translation Options - Only show when translation tab is active */}
          {activeTab === 'translation' && (
            <>
              <div className="flex items-center gap-2">
                <Select value={sourceLanguage} onValueChange={(v) => setSourceLanguage(v as 'auto' | TargetLanguage)}>
                  <SelectItem value="auto">자동</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh-CN">中文</SelectItem>
                </Select>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh-CN">中文</SelectItem>
                </Select>
              </div>
              <div className="w-px h-6 bg-zinc-200" />
            </>
          )}

          {/* Clipboard Button */}
          <button
            onClick={handlePasteFromClipboard}
            className="px-3 py-2 rounded-lg bg-white border border-zinc-200 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center gap-1.5"
          >
            <Clipboard className="w-3.5 h-3.5" />
            붙여넣기
          </button>

          {/* Execute Button */}
          <button
            onClick={() => handleProcess(inputText, activeTab)}
            disabled={loadingState === 'loading'}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 transition-all flex items-center gap-1.5 ml-auto disabled:opacity-50"
          >
            {loadingState === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                {activeTab === 'tone' ? '변환 실행' : '번역 실행'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Input and Result with equal width */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Input */}
        <section className="flex-1 flex flex-col border-r border-zinc-100">
          <div className="px-4 py-2.5 border-b border-zinc-50 bg-white">
            <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">입력</h2>
          </div>
          <div className="flex-1 p-4">
            <TextInput 
              value={inputText} 
              onChange={setInputText} 
              maxLength={5000} 
              placeholder="다듬거나 번역할 메시지를 입력하세요..." 
            />
          </div>
        </section>

        {/* Right: Result */}
        <section className="flex-1 flex flex-col bg-zinc-50/30">
          <div className="px-4 py-2.5 border-b border-zinc-100 bg-white/50">
            <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {activeTab === 'tone' ? '톤 변환 결과' : '번역 결과'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {aiError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 mb-3 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p className="text-[13px] font-medium">{aiError}</p>
              </div>
            )}

            {loadingState === 'loading' ? (
              <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="bca-gradient-spinner mb-3" />
                <p className="text-[12px] font-bold text-zinc-400 animate-pulse">AI가 응답을 생성하고 있습니다...</p>
              </div>
            ) : (
              <>
                {activeTab === 'tone' && results && (
                  <div className="space-y-2.5">
                    <ResultCard
                      tone="formal"
                      text={results.formal}
                      onCopy={writeClipboard}
                      onCopyError={(msg) => showStatusMessage(msg, 'error')}
                      isDefaultSelected={settings?.autoCopyTone === 'formal'}
                      onConvert={handleSingleToneConversion}
                      isLoading={convertingTones['formal']}
                    />
                    <ResultCard
                      tone="general"
                      text={results.general}
                      onCopy={writeClipboard}
                      onCopyError={(msg) => showStatusMessage(msg, 'error')}
                      isDefaultSelected={settings?.autoCopyTone === 'general'}
                      onConvert={handleSingleToneConversion}
                      isLoading={convertingTones['general']}
                    />
                    <ResultCard
                      tone="friendly"
                      text={results.friendly}
                      onCopy={writeClipboard}
                      onCopyError={(msg) => showStatusMessage(msg, 'error')}
                      isDefaultSelected={settings?.autoCopyTone === 'friendly'}
                      onConvert={handleSingleToneConversion}
                      isLoading={convertingTones['friendly']}
                    />
                  </div>
                )}

                {activeTab === 'translation' && translationResult && (
                  <div className="p-4 rounded-xl border border-zinc-100 bg-white space-y-3 shadow-sm">
                    <p className="font-sans text-[14px] leading-relaxed text-zinc-900 whitespace-pre-wrap">{translationResult}</p>
                    <div className="flex justify-end border-t border-zinc-50 pt-3">
                      <button 
                        onClick={() => { writeClipboard(translationResult!); showStatusMessage('✨ 복사 완료', 'success') }} 
                        className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[11px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        복사
                      </button>
                    </div>
                  </div>
                )}

                {loadingState === 'idle' && !results && !translationResult && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                    <Sparkles className="w-8 h-8 mb-3 opacity-10" />
                    <p className="text-[12px] font-medium">메시지를 입력하고 실행하세요</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
