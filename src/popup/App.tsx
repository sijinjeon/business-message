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

// 인라인 스타일 정의
const styles = {
  container: {
    width: '480px',
    height: '700px',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: 'linear-gradient(to right, #ffffff, #f8fafc)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  gripIcon: {
    color: '#cbd5e1',
    marginRight: '4px',
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
  },
  titleAccent: {
    color: '#2563eb',
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
  },
  main: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    overflow: 'hidden',
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
  },
  modeTabActive: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
  },
  modeTabInactive: {
    color: '#94a3b8',
  },
  optionsPanel: {
    minHeight: '40px',
  },
  toneOptions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
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
  labelRight: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 500,
  },
  textarea: {
    width: '100%',
    flex: 1,
    minHeight: '160px',
    padding: '16px',
    fontSize: '14px',
    lineHeight: 1.6,
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    resize: 'none' as const,
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  },
  textareaSource: {
    background: '#f8fafc',
    color: '#334155',
  },
  textareaResult: {
    background: 'rgba(239, 246, 255, 0.4)',
    color: '#1e293b',
    borderColor: '#dbeafe',
  },
  resultWrapper: {
    position: 'relative' as const,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  copyOverlay: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'opacity 0.2s',
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
  shortcutHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#94a3b8',
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
  footerButtons: {
    display: 'flex',
    gap: '8px',
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
  message: {
    padding: '6px 10px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    maxWidth: '180px',
  },
  messageSuccess: {
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  messageError: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '480px',
    height: '700px',
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
  section: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
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
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <svg style={styles.gripIcon} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/>
            <circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/>
          </svg>
          <div style={styles.logoBox}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M15 4V2M15 16v-2M8 9h2m10 0h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9m0 0l-4.5-4.5M12 12l4.5 4.5"/>
            </svg>
          </div>
          <h1 style={styles.title}>
            Nexus AI <span style={styles.titleAccent}>BCA</span>
          </h1>
        </div>
        <div style={styles.headerRight}>
          {message && (
            <div style={{
              ...styles.message,
              ...(messageType === 'success' ? styles.messageSuccess : styles.messageError)
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </button>
          <button 
            style={styles.iconButton}
            onClick={() => window.close()}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Mode Tabs & Options */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <nav style={styles.nav}>
            <button
              onClick={() => handleTabChange('tone')}
              disabled={loadingState === 'loading'}
              style={{
                ...styles.modeTab,
                ...(activeTab === 'tone' ? styles.modeTabActive : styles.modeTabInactive)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              톤 변환
            </button>
            <button
              onClick={() => handleTabChange('translation')}
              disabled={loadingState === 'loading'}
              style={{
                ...styles.modeTab,
                ...(activeTab === 'translation' ? styles.modeTabActive : styles.modeTabInactive)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
                <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
              </svg>
              AI 번역
            </button>
          </nav>

          {/* Options Panel - option-chip 스타일 사용 */}
          <div style={styles.optionsPanel}>
            {activeTab === 'tone' ? (
              <div style={styles.toneOptions}>
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.key}
                    onClick={() => setSelectedTone(tone.key)}
                    style={{
                      ...styles.optionChip,
                      ...(selectedTone === tone.key ? styles.optionChipActive : {})
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{tone.emoji}</span>
                    {tone.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={styles.toneOptions}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.key}
                    onClick={() => setTargetLanguage(lang.key)}
                    style={{
                      ...styles.optionChip,
                      ...(targetLanguage === lang.key ? styles.optionChipActive : {})
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{lang.emoji}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Source Input */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>
            <span style={styles.labelText}>Original Text</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={styles.labelRight}>{detectedLanguage} 감지됨</span>
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
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
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
            style={{ ...styles.textarea, ...styles.textareaSource }}
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
        <section style={styles.section}>
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
                ...styles.textarea, 
                ...styles.textareaResult,
                ...(loadingState === 'loading' ? { color: '#94a3b8' } : {})
              }}
              placeholder="AI 변환 결과가 여기에 표시됩니다..."
            />
            {currentResult && loadingState !== 'loading' && (
              <div style={{ ...styles.copyOverlay, opacity: isHoveringResult ? 1 : 0 }}>
                <button
                  onClick={handleCopyResult}
                  style={styles.copyButton}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                >
                  {isCopied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.shortcutHint}>
          <kbd style={styles.kbd}>Alt</kbd>
          <span>+</span>
          <kbd style={styles.kbd}>C</kbd>
        </div>
        <div style={styles.footerButtons}>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                결과 복사하기
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
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
      `}</style>
    </div>
  )
}

export default App
