import { useState, useEffect } from 'react'
import { AlertCircle, Sparkles, Command, ShieldCheck, Languages, MessageSquare, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectItem } from '@/components/ui/select'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ActionBar from './components/ActionBar'
import { AIApiResponse, TargetLanguage } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { useSettings } from '@/hooks/useSettings'
import { useAICall } from '@/hooks/useAICall'
import { logUsage } from '@/utils/storage'

function App() {
  const { settings, apiKeys, lastUsedTab, isLoading: isSettingsLoading, updateLastUsedTab } = useSettings()
  const { execute: runAI, loadingState, error: aiError } = useAICall()

  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState<AIApiResponse | null>(null)
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
      // 단축키로 열렸는지 확인
      const data = await chrome.storage.local.get(['lastCommand', 'commandTimestamp']);
      const now = Date.now();
      
      // 최근 2초 이내에 실행된 명령이 있는지 확인
      if (data.lastCommand && data.commandTimestamp && (now - data.commandTimestamp < 2000)) {
        const text = await readClipboard();
        if (text) {
          setInputText(text);
          
          if (data.lastCommand === '_execute_action') {
            // 번역 탭으로 전환 후 실행
            setActiveTab('translation');
            await updateLastUsedTab('translation');
            await handleProcess(text, 'translation');
          } else if (data.lastCommand === 'tone-conversion') {
            // 톤 변환 탭으로 전환 후 실행
            setActiveTab('tone');
            await updateLastUsedTab('tone');
            await handleProcess(text, 'tone');
          }
        }
        
        // 사용한 명령 플래그 초기화
        await chrome.storage.local.remove(['lastCommand', 'commandTimestamp']);
      } else {
        // 일반적인 팝업 열기 시 클립보드 읽기만 수행
        const text = await readClipboard();
        if (text && !inputText) {
          setInputText(text);
        }
      }
    };

    handleAutoProcess();
  }, []); // Mount 시에만 1회 실행

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
      targetLanguage: tab === 'translation' ? targetLanguage : undefined
    })

    if (response) {
      if (tab === 'tone') {
        const res = response as AIApiResponse
        setResults(res)
        if (settings.autoCopyEnabled) {
          await writeClipboard(res[settings.autoCopyTone])
          showStatusMessage('✨ 변환 및 복사가 완료되었습니다.', 'success')
        }
      } else {
        setTranslationResult(response as string)
        showStatusMessage('✨ 번역이 완료되었습니다.', 'success')
      }
      
      // 상세 로그 기록
      await logUsage({
        provider: settings.selectedProvider,
        model: settings.providerModels[settings.selectedProvider],
        task: tab === 'tone' ? 'tone-conversion' : 'translation',
        inputTokens: Math.ceil(text.length * 0.75),
        outputTokens: Math.ceil((typeof response === 'string' ? response.length : JSON.stringify(response).length) * 0.75)
      })
    }
  }

  const showStatusMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg); setMessageType(type)
    setTimeout(() => { setMessage(''); setMessageType('') }, 3000)
  }

  const handleTabChange = async (tab: 'tone' | 'translation') => {
    setActiveTab(tab)
    setResults(null); setTranslationResult(null)
    await updateLastUsedTab(tab)
  }

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
      window.close(); // 팝업 닫기
    } else {
      window.open('../options/index.html', '_blank');
    }
  }

  if (isSettingsLoading) return <div className="w-[800px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>

  return (
    <div className="w-[800px] h-[600px] bg-white relative flex flex-col overflow-hidden selection:bg-zinc-900/10">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold tracking-tight text-zinc-900 leading-none">BCA Assistant</h1>
            <p className="text-[12px] text-zinc-400 font-medium mt-1 uppercase tracking-[0.1em]">Smart Communication</p>
          </div>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <TabButton active={activeTab === 'tone'} onClick={() => handleTabChange('tone')} icon={<MessageSquare className="w-3.5 h-3.5" />} label="톤 변환" />
          <TabButton active={activeTab === 'translation'} onClick={() => handleTabChange('translation')} icon={<Languages className="w-3.5 h-3.5" />} label="전문 번역" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {activeTab === 'tone' ? '메시지 작성' : '원문 입력'}
            </h2>
            <div className="flex gap-2">
              {activeTab === 'translation' && (
                <div className="w-28">
                  <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
                    <SelectItem value="ko" className="text-sm">한국어</SelectItem>
                    <SelectItem value="en" className="text-sm">영어</SelectItem>
                    <SelectItem value="ja" className="text-sm">일본어</SelectItem>
                    <SelectItem value="zh-CN" className="text-sm">중국어</SelectItem>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          <TextInput value={inputText} onChange={setInputText} maxLength={5000} placeholder={activeTab === 'tone' ? "다듬고 싶은 메시지를 입력하세요..." : "번역할 내용을 입력하세요..."} />

          <ActionBar
            onRegenerate={() => handleProcess()}
            onReadClipboard={async () => {
              const text = await readClipboard()
              if (text) { 
                setInputText(text); 
                await handleProcess(text); 
              }
            }}
            isLoading={loadingState === 'loading'}
            onOpenSettings={handleOpenSettings}
            activeTab={activeTab}
          />
        </section>

        {(message || aiError) && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            messageType === 'error' || aiError ? 'bg-destructive/5 border-destructive/10 text-destructive' : 'bg-zinc-50 border-zinc-100 text-zinc-900'
          }`}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[15px] font-medium">{aiError || message}</p>
          </div>
        )}

        <section className="space-y-5">
          <h2 className="text-[14px] font-bold text-zinc-400 uppercase tracking-widest px-1">결과 영역</h2>
          <div className="grid grid-cols-1 gap-5">
            {loadingState === 'loading' && (
              <>
                <Skeleton className="h-[120px] rounded-2xl bg-zinc-50" />
                {activeTab === 'tone' && <Skeleton className="h-[120px] rounded-2xl bg-zinc-50" />}
              </>
            )}

            {activeTab === 'tone' && results && (
              <>
                <ResultCard tone="formal" text={results.formal} onCopy={writeClipboard} isDefaultSelected={settings?.autoCopyTone === 'formal'} />
                <ResultCard tone="general" text={results.general} onCopy={writeClipboard} isDefaultSelected={settings?.autoCopyTone === 'general'} />
                <ResultCard tone="friendly" text={results.friendly} onCopy={writeClipboard} isDefaultSelected={settings?.autoCopyTone === 'friendly'} />
              </>
            )}

            {activeTab === 'translation' && translationResult && (
              <div className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 space-y-4">
                <p className="text-[16px] leading-relaxed text-zinc-900 whitespace-pre-wrap">{translationResult}</p>
                <div className="flex justify-end">
                  <button onClick={() => { writeClipboard(translationResult!); showStatusMessage('✨ 클립보드에 복사되었습니다.', 'success') }} className="text-[13px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-wider transition-colors">
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            )}

            {loadingState === 'idle' && !results && !translationResult && (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-300 border border-dashed border-zinc-100 rounded-3xl">
                <Sparkles className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-base font-medium">준비되었습니다. {activeTab === 'tone' ? '변환' : '번역'}을 시작해 보세요.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="px-8 py-4 border-t border-zinc-50 flex items-center justify-between text-[12px] text-zinc-400 font-bold uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Secured by {settings?.selectedProvider.toUpperCase()}
        </div>
        <div>v2.3.0</div>
      </footer>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[14px] font-bold transition-all ${
      active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
    }`}>
      {icon}
      {label}
    </button>
  )
}

export default App
