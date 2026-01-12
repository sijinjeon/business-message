import { useState, useEffect } from 'react'

import { AIApiResponse, TargetLanguage } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { useSettings } from '@/hooks/useSettings'
import { useAICall } from '@/hooks/useAICall'
import { logUsage } from '@/utils/storage'

type ToneType = 'formal' | 'general' | 'friendly'

const TONE_OPTIONS: { key: ToneType; label: string; emoji: string }[] = [
  { key: 'formal', label: '비즈니스', emoji: '💼' },
  { key: 'general', label: '사내 협업', emoji: '🏢' },
  { key: 'friendly', label: '캐주얼', emoji: '😊' }
]

const LANGUAGE_OPTIONS: { key: TargetLanguage; label: string; emoji: string }[] = [
  { key: 'ko', label: '한국어', emoji: '🇰🇷' },
  { key: 'en', label: 'English', emoji: '🇺🇸' },
  { key: 'ja', label: '日本語', emoji: '🇯🇵' },
  { key: 'zh-CN', label: '中文', emoji: '🇨🇳' }
]

// Design System Styles - bca_popup_v2.html 기반
const styles = {
  popupContainer: {
    width: '480px',
    height: '600px',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  },
  dragHeader: {
    cursor: 'grab',
    background: 'linear-gradient(to right, #ffffff, #f8fafc)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoBox: {
    background: '#2563eb',
    padding: '4px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    color: '#94a3b8',
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableMain: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    scrollbarGutter: 'stable' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  nav: {
    display: 'flex',
    borderBottom: '1px solid #f1f5f9',
  },
  modeTab: {
    flex: 1,
    padding: '8px',
    fontSize: '12px',
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#94a3b8',
  },
  modeTabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  optionsPanel: {
    minHeight: '40px',
  },
  optionChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#64748b',
  },
  optionChipActive: {
    background: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#1d4ed8',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  labelText: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#64748b',
  },
  labelTextBlue: {
    color: '#2563eb',
  },
  inputBoxShared: {
    width: '100%',
    minHeight: '140px',
    padding: '16px',
    fontSize: '14px',
    lineHeight: 1.6,
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'none' as const,
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    boxSizing: 'border-box' as const,
  },
  inputSource: {
    background: '#f8fafc',
    color: '#334155',
  },
  inputResult: {
    background: 'rgba(239, 246, 255, 0.4)',
    color: '#1e293b',
    borderColor: '#dbeafe',
  },
  resultWrapper: {
    position: 'relative' as const,
  },
  copyOverlay: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '4px',
  },
  copyButton: {
    background: '#ffffff',
    padding: '6px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexShrink: 0,
    padding: '16px',
    background: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kbd: {
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '10px',
    fontFamily: 'monospace',
  },
  cancelButton: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    padding: '8px 24px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
    background: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusMessage: {
    padding: '6px 10px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    maxWidth: '180px',
  },
  statusSuccess: {
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  statusError: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '480px',
    height: '600px',
    background: '#ffffff',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}

function App() {
  const { settings, apiKeys, lastUsedTab, isLoading: isSettingsLoading, updateLastUsedTab } = useSettings()
  const { execute: runAI, loadingState, error: aiError } = useAICall()

  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState<Partial<AIApiResponse> | null>(null)
  const [translationResult, setTranslationResult] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tone' | 'translation'>('tone')
  const [selectedTone, setSelectedTone] = useState<ToneType>('formal')
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('ko')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [isCopied, setIsCopied] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string>('KO')
  const [isHoveringResult, setIsHoveringResult] = useState(false)

  useEffect(() => {
    if (settings) {
      setTargetLanguage(settings.translation.defaultTargetLanguage)
      setActiveTab(lastUsedTab)
      setSelectedTone(settings.autoCopyTone || 'formal')
    }
  }, [settings?.translation.defaultTargetLanguage, lastUsedTab, settings?.autoCopyTone])

  useEffect(() => {
    const handleAutoProcess = async () => {
      if (isSettingsLoading || !settings) return

      const data = await chrome.storage.local.get(['lastCommand', 'commandTimestamp'])
      const now = Date.now()
      
      if (data.lastCommand && data.commandTimestamp && (now - data.commandTimestamp < 5000)) {
        console.log(`[BCA] Auto-processing command: ${data.lastCommand}`)
        const text = await readClipboard()
        if (text) {
          setInputText(text)
          detectLanguage(text)
          
          if (data.lastCommand === 'translation') {
            setActiveTab('translation')
            await updateLastUsedTab('translation')
            await handleProcess(text, 'translation')
          } else if (data.lastCommand === 'tone-conversion' || data.lastCommand === '_execute_action') {
            setActiveTab('tone')
            await updateLastUsedTab('tone')
            await handleProcess(text, 'tone')
          }
        }
        await chrome.storage.local.remove(['lastCommand', 'commandTimestamp'])
      } else {
        if (!inputText) {
          const text = await readClipboard()
          if (text) {
            setInputText(text)
            detectLanguage(text)
          }
        }
      }
    }

    handleAutoProcess()
  }, [isSettingsLoading, settings])

  const detectLanguage = (text: string) => {
    const koreanRegex = /[\uAC00-\uD7AF]/
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/
    const chineseRegex = /[\u4E00-\u9FFF]/
    
    if (koreanRegex.test(text)) setDetectedLanguage('KO')
    else if (japaneseRegex.test(text)) setDetectedLanguage('JA')
    else if (chineseRegex.test(text)) setDetectedLanguage('ZH')
    else setDetectedLanguage('EN')
  }

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
      tone: tab === 'tone' ? selectedTone : undefined
    })

    if (response) {
      if (tab === 'tone') {
        const res = response as AIApiResponse
        setResults(res)
        if (settings.autoCopyEnabled && res[selectedTone]) {
          await writeClipboard(res[selectedTone]!)
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

  const showStatusMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)

    if (type === 'success') {
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 2000)
    }
  }

  const dismissMessage = () => {
    setMessage('')
    setMessageType('')
  }

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      window.open('../options/index.html', '_blank')
    }
  }

  const handlePasteFromClipboard = async () => {
    const text = await readClipboard()
    if (text) {
      setInputText(text)
      detectLanguage(text)
    }
  }

  const handleCopyResult = async () => {
    const textToCopy = activeTab === 'tone' 
      ? results?.[selectedTone] 
      : translationResult

    if (!textToCopy) return
    
    try {
      await writeClipboard(textToCopy)
      setIsCopied(true)
      showStatusMessage('✨ 복사 완료', 'success')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      showStatusMessage('클립보드 복사에 실패했습니다.', 'error')
    }
  }

  const handleTabChange = (tab: 'tone' | 'translation') => {
    setActiveTab(tab)
    updateLastUsedTab(tab)
  }

  const currentResult = activeTab === 'tone' ? results?.[selectedTone] : translationResult

  if (isSettingsLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={styles.popupContainer}>
      {/* Header */}
      <header style={styles.dragHeader}>
        <div style={styles.headerLeft}>
          <i className="fa-solid fa-grip-vertical" style={{ color: '#cbd5e1', marginRight: '4px' }}></i>
          <div style={styles.logoBox}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'white', fontSize: '12px' }}></i>
          </div>
          <h1 style={styles.title}>
            Nexus AI <span style={{ color: '#2563eb' }}>BCA</span>
          </h1>
        </div>
        <div style={styles.headerRight}>
          {message && (
            <div style={{
              ...styles.statusMessage,
              ...(messageType === 'success' ? styles.statusSuccess : styles.statusError)
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message}</span>
              {messageType === 'error' && (
                <button 
                  onClick={dismissMessage} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <button 
            onClick={handleOpenSettings}
            style={styles.iconButton}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <button 
            style={styles.iconButton}
            onClick={() => window.close()}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main style={styles.scrollableMain} className="custom-scrollbar">
        {/* Mode Tabs & Options */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <nav style={styles.nav}>
            <button
              id="btn-tone"
              onClick={() => handleTabChange('tone')}
              disabled={loadingState === 'loading'}
              style={{
                ...styles.modeTab,
                ...(activeTab === 'tone' ? styles.modeTabActive : {})
              }}
            >
              <i className="fa-solid fa-bullhorn" style={{ opacity: 0.7 }}></i>
              톤 변환
            </button>
            <button
              id="btn-translate"
              onClick={() => handleTabChange('translation')}
              disabled={loadingState === 'loading'}
              style={{
                ...styles.modeTab,
                ...(activeTab === 'translation' ? styles.modeTabActive : {})
              }}
            >
              <i className="fa-solid fa-language" style={{ opacity: 0.7 }}></i>
              AI 번역
            </button>
          </nav>

          {/* Options Panel */}
          <div id="options-panel" style={styles.optionsPanel}>
            <div id="tone-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(activeTab === 'tone' ? TONE_OPTIONS : LANGUAGE_OPTIONS).map((option) => (
                <button
                  key={option.key}
                  onClick={() => activeTab === 'tone' 
                    ? setSelectedTone(option.key as ToneType) 
                    : setTargetLanguage(option.key as TargetLanguage)
                  }
                  style={{
                    ...styles.optionChip,
                    ...((activeTab === 'tone' ? selectedTone === option.key : targetLanguage === option.key) 
                      ? styles.optionChipActive 
                      : {})
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Source Input */}
        <section>
          <div style={styles.sectionLabel}>
            <span style={styles.labelText}>Original Text</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{detectedLanguage} 감지됨</span>
              <button
                onClick={handlePasteFromClipboard}
                style={{ 
                  fontSize: '10px', 
                  color: '#3b82f6', 
                  fontWeight: 500, 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <i className="fa-regular fa-clipboard" style={{ fontSize: '10px' }}></i>
                붙여넣기
              </button>
            </div>
          </div>
          <textarea
            id="source-textarea"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              detectLanguage(e.target.value)
            }}
            style={{ ...styles.inputBoxShared, ...styles.inputSource }}
            placeholder="변환하고 싶은 문장을 입력하세요..."
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </section>

        {/* AI Result */}
        <section>
          <div style={styles.sectionLabel}>
            <span style={{ ...styles.labelText, ...styles.labelTextBlue }}>AI Result</span>
            {aiError && (
              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 500 }}>{aiError}</span>
            )}
          </div>
          <div 
            style={styles.resultWrapper}
            onMouseEnter={() => setIsHoveringResult(true)}
            onMouseLeave={() => setIsHoveringResult(false)}
          >
            <textarea
              id="result-textarea"
              value={loadingState === 'loading' ? 'AI가 응답을 생성하고 있습니다...' : (currentResult || '')}
              readOnly
              style={{ 
                ...styles.inputBoxShared, 
                ...styles.inputResult,
                ...(loadingState === 'loading' ? { color: '#94a3b8' } : {})
              }}
              placeholder="AI 변환 결과가 여기에 표시됩니다..."
            />
            {currentResult && loadingState !== 'loading' && (
              <div style={{ ...styles.copyOverlay, opacity: isHoveringResult ? 1 : 0, transition: 'opacity 0.2s' }}>
                <button
                  onClick={handleCopyResult}
                  style={styles.copyButton}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                >
                  {isCopied ? (
                    <i className="fa-solid fa-check" style={{ color: '#22c55e' }}></i>
                  ) : (
                    <i className="fa-regular fa-copy"></i>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* Spacer */}
        <div style={{ height: '8px' }}></div>
      </main>

      {/* Footer - Fixed */}
      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}>
          <kbd style={styles.kbd}>Alt</kbd>
          <span>+</span>
          <kbd style={styles.kbd}>C</kbd>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => window.close()}
            style={styles.cancelButton}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            취소
          </button>
          <button
            id="copy-btn"
            onClick={currentResult ? handleCopyResult : () => handleProcess()}
            disabled={loadingState === 'loading' || (!inputText.trim() && !currentResult)}
            style={{
              ...styles.primaryButton,
              ...(loadingState === 'loading' || (!inputText.trim() && !currentResult) ? { opacity: 0.5, cursor: 'not-allowed' } : {})
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#1d4ed8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb' }}
          >
            {loadingState === 'loading' ? (
              <>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#ffffff', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite' 
                }} />
                처리 중...
              </>
            ) : currentResult ? (
              <>
                <i className="fa-solid fa-copy"></i>
                결과 복사하기
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                {activeTab === 'tone' ? '변환 실행' : '번역 실행'}
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Global animation keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default App
