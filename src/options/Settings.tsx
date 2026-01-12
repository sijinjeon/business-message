import { useState, useEffect } from 'react'
import { StorageService } from '@/services/storage-service'
import { AIOrchestrator } from '@/services/ai/ai-orchestrator'
import { AI_MODELS } from '@/services/ai/models'
import { AIProvider, TargetLanguage, UsageLog } from '@/types'
import { encryptData, decryptData } from '@/utils/crypto'
import { useCommands } from '@/hooks/useCommands'
import { useCurrency } from '@/hooks/useCurrency'

type ValidationState = 'idle' | 'testing' | 'success' | 'error'
type MenuId = 'general' | 'ai-engines' | 'translation' | 'shortcuts' | 'ai-intelligence'
type ToneType = 'formal' | 'general' | 'friendly'

const TONE_OPTIONS: { key: ToneType; label: string; emoji: string }[] = [
  { key: 'formal', label: '비즈니스 (격식)', emoji: '💼' },
  { key: 'general', label: '사내 협업', emoji: '🏢' },
  { key: 'friendly', label: '캐주얼', emoji: '😊' }
]

// Design System Styles - bca_settings_v1.html 기반
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    color: '#0f172a',
  },
  sidebar: {
    width: '256px',
    background: '#ffffff',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBox: {
    background: '#2563eb',
    padding: '6px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarNav: {
    flex: 1,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
    width: '100%',
  },
  sidebarItemActive: {
    background: '#eff6ff',
    color: '#2563eb',
    borderRight: '3px solid #2563eb',
  },
  sidebarFooter: {
    padding: '24px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '11px',
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    padding: '40px 48px',
    maxWidth: '1200px',
    minWidth: 0,
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  saveButton: {
    background: '#2563eb',
    color: '#ffffff',
    padding: '10px 24px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  settingCard: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '32px',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
  },
  cardIconBlue: {
    background: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
  },
  cardTitle: {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '16px',
    margin: 0,
  },
  cardDescription: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 500,
    margin: 0,
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '8px',
    display: 'block',
  },
  inputBox: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    boxSizing: 'border-box' as const,
  },
  optionChip: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
  },
  optionChipActive: {
    background: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#1d4ed8',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  },
  alert: {
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 700,
  },
  alertSuccess: {
    background: '#2563eb',
    color: '#ffffff',
  },
  alertError: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  kpiCard: {
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  kpiLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  kpiValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
  },
  filterBox: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    marginBottom: '24px',
  },
  chartBox: {
    padding: '24px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    height: '192px',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  tableHeader: {
    background: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f8fafc',
  },
  shortcutItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '12px',
  },
  shortcutSet: {
    background: 'rgba(236, 253, 245, 0.5)',
    borderColor: 'rgba(167, 243, 208, 0.6)',
  },
  shortcutNotSet: {
    background: 'rgba(254, 252, 232, 0.5)',
    borderColor: 'rgba(253, 230, 138, 0.6)',
  },
  kbd: {
    minWidth: '32px',
    height: '32px',
    padding: '0 10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#334155',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTipBox: {
    padding: '24px',
    background: '#2563eb',
    borderRadius: '16px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '24px',
  },
  aiIntelligenceCard: {
    background: 'linear-gradient(to bottom right, #ffffff, rgba(239, 246, 255, 0.3))',
    borderRadius: '16px',
    border: '2px solid #dbeafe',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '32px',
    marginBottom: '32px',
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
  },
}

function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('ai-engines')
  const { commands } = useCommands()
  const { formatCost } = useCurrency()
  
  // AI 설정 상태
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>('gemini')
  const [apiKeys, setApiKeys] = useState({ gemini: '', chatgpt: '', claude: '' })
  const [providerModels, setProviderModels] = useState({ gemini: '', chatgpt: '', claude: '' })
  
  // 사용량 데이터 상태
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [dashboardFilter, setDashboardFilter] = useState({
    provider: 'all',
    model: 'all',
    task: 'all',
    period: '7d'
  })
  
  // 기능 설정 상태
  const [autoCopyEnabled, setAutoCopyEnabledState] = useState(true)
  const [autoCopyTone, setAutoCopyToneState] = useState<ToneType>('formal')
  const [instantToneStyle, setInstantToneStyleState] = useState<ToneType>('formal')
  const [targetLang, setTargetLang] = useState<TargetLanguage>('ko')
  
  // AI Intelligence 상태
  const [workDescription, setWorkDescription] = useState('')
  const [aiOptimizeStatus, setAiOptimizeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [aiOptimizeResult, setAiOptimizeResult] = useState('')
  const [aiOptimizeError, setAiOptimizeError] = useState('')
  
  // UI 상태
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await StorageService.getAll()
      
      const decryptedKeys = {
        gemini: data.apiKeys.gemini ? await decryptData(data.apiKeys.gemini) : '',
        chatgpt: data.apiKeys.chatgpt ? await decryptData(data.apiKeys.chatgpt) : '',
        claude: data.apiKeys.claude ? await decryptData(data.apiKeys.claude) : ''
      }

      setSelectedProviderState(data.settings.selectedProvider)
      setProviderModels(data.settings.providerModels)
      setTargetLang(data.settings.translation.defaultTargetLanguage)
      setApiKeys(decryptedKeys)
      setAutoCopyEnabledState(data.settings.autoCopyEnabled)
      setAutoCopyToneState(data.settings.autoCopyTone)
      setInstantToneStyleState(data.settings.instantToneStyle || 'formal')
      setUsageLogs(data.usageLogs || [])
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  // 필터링된 로그 가져오기
  const filteredLogs = usageLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const now = new Date()
    
    if (dashboardFilter.period === '1d') {
      if (now.getTime() - logDate.getTime() > 24 * 60 * 60 * 1000) return false
    } else if (dashboardFilter.period === '7d') {
      if (now.getTime() - logDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false
    } else if (dashboardFilter.period === '30d') {
      if (now.getTime() - logDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false
    }
    
    if (dashboardFilter.provider !== 'all' && log.provider !== dashboardFilter.provider) return false
    if (dashboardFilter.model !== 'all' && log.model !== dashboardFilter.model) return false
    if (dashboardFilter.task !== 'all' && log.task !== dashboardFilter.task) return false
    
    return true
  })

  const handleSaveAll = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      const currentApiKey = apiKeys[selectedProvider]
      const encryptedKey = currentApiKey.trim() ? await encryptData(currentApiKey.trim()) : ''
      
      await StorageService.saveApiKey(selectedProvider, encryptedKey)
      await StorageService.updateSettings({
        selectedProvider,
        providerModels,
        autoCopyEnabled,
        autoCopyTone,
        instantToneStyle,
        translation: {
          defaultTargetLanguage: targetLang,
          preserveLineBreaks: true,
          showNotification: true
        }
      })
      
      setValidationState('success')
      setMessage('설정이 안전하게 저장되었습니다.')
      setTimeout(() => { setMessage(''); setValidationState('idle') }, 3000)
    } catch (error) {
      console.error('Save error:', error)
      setValidationState('error')
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    if (!currentApiKey.trim()) {
      setValidationState('error')
      setMessage('API 키를 먼저 입력해주세요.')
      return
    }
    setValidationState('testing')
    try {
      const result = await AIOrchestrator.execute('Test', 'translation', {
        provider: selectedProvider,
        model: providerModels[selectedProvider],
        apiKey: currentApiKey.trim(),
        targetLanguage: 'en'
      })
      const isValid = !!result
      setValidationState(isValid ? 'success' : 'error')
      setMessage(isValid ? '연결에 성공했습니다!' : '유효하지 않은 API 키입니다.')
    } catch (err: any) {
      console.error('Test error:', err)
      setValidationState('error')
      setMessage(err.message || '연결 테스트 중 오류가 발생했습니다.')
    }
  }

  const handleAiOptimize = async () => {
    if (!workDescription.trim()) {
      setAiOptimizeError('직무 설명을 입력해주세요.')
      return
    }
    
    const apiKey = apiKeys.gemini
    if (!apiKey) {
      setAiOptimizeError('Gemini API 키를 먼저 설정해주세요.')
      return
    }

    setAiOptimizeStatus('loading')
    setAiOptimizeError('')
    setAiOptimizeResult('')

    try {
      const systemPrompt = "당신은 비즈니스 커뮤니케이션 전문가입니다. 사용자의 직무 설명을 바탕으로, 해당 사용자에게 가장 적합한 AI 시스템 프롬프트와 페르소나를 한 문장으로 생성하십시오. 출력은 따옴표 없이 한국어로만 작성하세요."
      
      const result = await AIOrchestrator.execute(
        `${systemPrompt}\n\n사용자 직무: ${workDescription}`,
        'translation',
        {
          provider: 'gemini',
          model: providerModels.gemini,
          apiKey,
          targetLanguage: 'ko'
        }
      )

      if (result) {
        setAiOptimizeResult(result as string)
        setAiOptimizeStatus('success')
      } else {
        throw new Error('결과를 생성할 수 없습니다.')
      }
    } catch (err: any) {
      setAiOptimizeError('AI 연결 중 오류가 발생했습니다. 다시 시도해주세요.')
      setAiOptimizeStatus('error')
    }
  }

  const parseShortcut = (shortcut: string): string[] => {
    if (!shortcut) return []
    const keys = shortcut.split('+').map(key => key.trim())
    return keys.map(key => {
      const normalizedKey = key.toLowerCase()
      if (key === '⌘' || normalizedKey === 'command' || normalizedKey === 'cmd') return '⌘'
      if (key === '⌥' || normalizedKey === 'alt' || normalizedKey === 'option') return '⌥'
      if (key === '⌃' || normalizedKey === 'ctrl' || normalizedKey === 'control') return '⌃'
      if (key === '⇧' || normalizedKey === 'shift') return '⇧'
      return key.length === 1 ? key.toUpperCase() : key
    })
  }

  const getMenuTitle = () => {
    switch (activeMenu) {
      case 'ai-engines': return 'AI 모델 설정'
      case 'general': return '개인화 선호도'
      case 'ai-intelligence': return '✨ AI 인텔리전스'
      case 'translation': return '번역 설정'
      case 'shortcuts': return '단축키 가이드'
      default: return '설정'
    }
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'white', fontSize: '16px' }}></i>
          </div>
          <span style={{ fontWeight: 700, color: '#1e293b', letterSpacing: '-0.025em' }}>
            Nexus AI <span style={{ color: '#2563eb' }}>BCA</span>
          </span>
        </div>

        <nav style={styles.sidebarNav}>
          {[
            { id: 'ai-engines', icon: 'fa-microchip', label: 'AI 모델 설정' },
            { id: 'general', icon: 'fa-sliders', label: '개인화 선호도' },
            { id: 'ai-intelligence', icon: 'fa-sparkles', label: '✨ AI 인텔리전스' },
            { id: 'translation', icon: 'fa-language', label: '번역 설정' },
            { id: 'shortcuts', icon: 'fa-keyboard', label: '단축키 가이드' },
          ].map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id as MenuId)}
              style={{
                ...styles.sidebarItem,
                ...(activeMenu === menu.id ? styles.sidebarItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== menu.id) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#1e293b'
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== menu.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748b'
                }
              }}
            >
              <i className={`fa-solid ${menu.icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
              {menu.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <p style={{ margin: 0 }}>© 2026 Nexus AI Studio</p>
          <p style={{ margin: 0 }}>Version 2.5.1 Stable</p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>{getMenuTitle()}</h2>
            <p style={styles.subtitle}>AI 모델 연동 및 커뮤니케이션 스타일을 개인화하십시오.</p>
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            style={{
              ...styles.saveButton,
              opacity: isSaving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#1d4ed8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb' }}
          >
            {isSaving ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            ) : (
              <i className="fa-solid fa-floppy-disk"></i>
            )}
            변경 사항 저장
          </button>
        </header>

        {/* Status Message */}
        {message && (
          <div style={{
            ...styles.alert,
            ...(validationState === 'error' ? styles.alertError : styles.alertSuccess)
          }}>
            <i className={`fa-solid ${validationState === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
            {message}
          </div>
        )}

        {/* AI Engines Settings */}
        {activeMenu === 'ai-engines' && (
          <>
            <section style={styles.settingCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>API 연동 관리</h3>
                  <p style={styles.cardDescription}>서비스를 구동하기 위한 AI 모델의 API 키를 설정합니다.</p>
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>활성 엔진</label>
                  <select 
                    value={selectedProvider} 
                    onChange={(e) => setSelectedProviderState(e.target.value as AIProvider)}
                    style={styles.select}
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="chatgpt">OpenAI GPT</option>
                    <option value="claude">Anthropic Claude</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>상세 모델</label>
                  <select 
                    value={providerModels[selectedProvider]} 
                    onChange={(e) => setProviderModels(prev => ({ ...prev, [selectedProvider]: e.target.value }))}
                    style={styles.select}
                  >
                    {AI_MODELS[selectedProvider].map(m => {
                      const costs = formatCost(m.pricePer1M)
                      return (
                        <option key={m.id} value={m.id}>
                          {m.name} - {costs.krw} ({costs.usd}) / 1M tokens
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>API KEY</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a 
                      href={
                        selectedProvider === 'gemini' ? 'https://aistudio.google.com/app/api-keys' :
                        selectedProvider === 'chatgpt' ? 'https://platform.openai.com/api-keys' :
                        'https://platform.claude.com/settings/keys'
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <i className="fa-solid fa-external-link-alt" style={{ fontSize: '10px' }}></i>
                      API 키 발급받기
                    </a>
                    <button 
                      onClick={handleTestConnection} 
                      disabled={validationState === 'testing'} 
                      style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {validationState === 'testing' ? (
                        <div style={{ width: '12px', height: '12px', border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      ) : (
                        <i className="fa-solid fa-plug" style={{ fontSize: '10px' }}></i>
                      )}
                      연결 테스트
                    </button>
                  </div>
                </div>
                <input 
                  type="password" 
                  value={apiKeys[selectedProvider]} 
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [selectedProvider]: e.target.value }))} 
                  placeholder="인증 키를 입력하세요" 
                  style={styles.inputBox}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </section>

            {/* Usage Dashboard */}
            <section style={styles.settingCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>사용량 분석 대시보드</h3>
                  <p style={styles.cardDescription}>API 호출 내역과 비용을 모니터링합니다.</p>
                </div>
              </div>

              {/* Filters */}
              <div style={styles.filterBox}>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ ...styles.kpiLabel, marginBottom: '6px' }}>
                    <i className="fa-solid fa-microchip" style={{ fontSize: '10px' }}></i> 엔진
                  </label>
                  <select 
                    value={dashboardFilter.provider} 
                    onChange={(e) => setDashboardFilter(prev => ({ ...prev, provider: e.target.value }))}
                    style={{ ...styles.select, padding: '8px 12px', fontSize: '12px' }}
                  >
                    <option value="all">전체 엔진</option>
                    <option value="gemini">Gemini</option>
                    <option value="chatgpt">OpenAI</option>
                    <option value="claude">Claude</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ ...styles.kpiLabel, marginBottom: '6px' }}>
                    <i className="fa-solid fa-filter" style={{ fontSize: '10px' }}></i> 태스크
                  </label>
                  <select 
                    value={dashboardFilter.task} 
                    onChange={(e) => setDashboardFilter(prev => ({ ...prev, task: e.target.value }))}
                    style={{ ...styles.select, padding: '8px 12px', fontSize: '12px' }}
                  >
                    <option value="all">전체 작업</option>
                    <option value="tone-conversion">톤 변환</option>
                    <option value="translation">번역</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ ...styles.kpiLabel, marginBottom: '6px' }}>
                    <i className="fa-solid fa-calendar" style={{ fontSize: '10px' }}></i> 기간
                  </label>
                  <select 
                    value={dashboardFilter.period} 
                    onChange={(e) => setDashboardFilter(prev => ({ ...prev, period: e.target.value }))}
                    style={{ ...styles.select, padding: '8px 12px', fontSize: '12px' }}
                  >
                    <option value="1d">오늘</option>
                    <option value="7d">최근 7일</option>
                    <option value="30d">최근 한달</option>
                    <option value="all">전체</option>
                  </select>
                </div>
                <button 
                  onClick={() => setDashboardFilter({ provider: 'all', model: 'all', task: 'all', period: '7d' })}
                  style={{ marginTop: '20px', padding: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-rotate-right" style={{ color: '#94a3b8' }}></i>
                </button>
              </div>

              {/* KPIs */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>
                    <i className="fa-solid fa-arrow-trend-up"></i> 총 호출
                  </div>
                  <div style={styles.kpiValue}>{filteredLogs.length}회</div>
                </div>
                <div style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>
                    <i className="fa-solid fa-chart-bar"></i> 총 비용
                  </div>
                  <div>
                    {(() => {
                      const totalUSD = filteredLogs.reduce((acc, curr) => acc + (curr.cost || 0), 0)
                      const costs = formatCost(totalUSD)
                      return (
                        <>
                          <div style={styles.kpiValue}>{costs.krw}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{costs.usd}</div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>
                    <i className="fa-solid fa-clock"></i> 평균 응답
                  </div>
                  <div style={styles.kpiValue}>1.2s</div>
                </div>
                <div style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>
                    <i className="fa-solid fa-microchip"></i> 추정 토큰
                  </div>
                  <div style={styles.kpiValue}>
                    {Math.round(filteredLogs.reduce((acc, curr) => acc + (curr.inputTokens || 0) + (curr.outputTokens || 0), 0) / 1000)}K
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ ...styles.chartBox, marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '14px', color: '#334155' }}>
                  <i className="fa-solid fa-arrow-trend-up"></i> 일별 사용량 추이
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '100px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  {[...Array(7)].map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - i))
                    const count = usageLogs.filter(l => new Date(l.timestamp).toDateString() === date.toDateString()).length
                    const maxCount = Math.max(...[...Array(7)].map((_, j) => {
                      const d = new Date()
                      d.setDate(d.getDate() - (6 - j))
                      return usageLogs.filter(l => new Date(l.timestamp).toDateString() === d.toDateString()).length
                    }), 1)
                    const height = (count / maxCount) * 100
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div 
                          style={{ 
                            width: '100%', 
                            background: '#2563eb', 
                            borderRadius: '4px 4px 0 0',
                            height: `${height || 5}%`,
                            transition: 'all 0.3s'
                          }} 
                        />
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, marginTop: '8px' }}>{date.getDate()}일</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-clock-rotate-left"></i> 상세 실행 로그
                  </div>
                  <button style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-download"></i> 내보내기
                  </button>
                </div>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>일시</th>
                      <th style={styles.th}>엔진/모델</th>
                      <th style={styles.th}>작업</th>
                      <th style={styles.th}>토큰(IN/OUT)</th>
                      <th style={styles.th}>비용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 10).map((log, i) => {
                      const costs = formatCost(log.cost || 0)
                      return (
                        <tr key={i}>
                          <td style={{ ...styles.td, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                            {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', textTransform: 'uppercase' }}>{log.provider}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{log.model}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '10px', 
                              fontWeight: 700,
                              background: log.task === 'tone-conversion' ? '#eff6ff' : '#faf5ff',
                              color: log.task === 'tone-conversion' ? '#2563eb' : '#9333ea'
                            }}>
                              {log.task === 'tone-conversion' ? '톤 변환' : '번역'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                            {log.inputTokens}/{log.outputTokens}
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>{costs.krw}</div>
                            <div style={{ fontSize: '9px', color: '#94a3b8' }}>{costs.usd}</div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8', fontStyle: 'italic' }}>
                          데이터가 존재하지 않습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* General Settings */}
        {activeMenu === 'general' && (
          <>
            <section style={styles.settingCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>기본 톤 및 개인화</h3>
                  <p style={styles.cardDescription}>변환 시 가장 우선적으로 적용될 커뮤니케이션 스타일을 선택합니다.</p>
                </div>
              </div>

              <div style={styles.checkboxWrapper}>
                <input 
                  type="checkbox" 
                  id="auto-copy" 
                  checked={autoCopyEnabled} 
                  onChange={(e) => setAutoCopyEnabledState(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                />
                <div>
                  <label htmlFor="auto-copy" style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', cursor: 'pointer', display: 'block' }}>
                    변환 완료 시 결과물 자동 복사
                  </label>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    팝업에서 톤 변환이 완료되면 즉시 클립보드에 저장합니다.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={styles.label}>기본 톤 (Default Tone)</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.key}
                      onClick={() => setAutoCopyToneState(tone.key)}
                      style={{
                        ...styles.optionChip,
                        ...(autoCopyTone === tone.key ? styles.optionChipActive : {})
                      }}
                    >
                      <span>{tone.emoji}</span>
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section style={styles.settingCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <i className="fa-solid fa-keyboard"></i>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>즉시 변환 스타일</h3>
                  <p style={styles.cardDescription}>텍스트 선택 후 단축키로 즉시 변환할 때 적용되는 스타일입니다.</p>
                </div>
              </div>

              <div style={styles.checkboxWrapper}>
                <i className="fa-solid fa-keyboard" style={{ color: '#94a3b8', fontSize: '20px', marginTop: '2px' }}></i>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>즉시 정중한 문장 변환 설정</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    텍스트를 선택하고 단축키(
                    <kbd style={{ ...styles.kbd, minWidth: 'auto', height: 'auto', padding: '2px 6px', fontSize: '11px', margin: '0 2px' }}>
                      {commands.find(c => c.name === 'instant-tone-conversion')?.shortcut || '설정되지 않음'}
                    </kbd>
                    )를 누르면, 즉시 교체됩니다.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={styles.label}>적용할 스타일</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.key}
                      onClick={() => setInstantToneStyleState(tone.key)}
                      style={{
                        ...styles.optionChip,
                        ...(instantToneStyle === tone.key ? styles.optionChipActive : {})
                      }}
                    >
                      <span>{tone.emoji}</span>
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* AI Intelligence */}
        {activeMenu === 'ai-intelligence' && (
          <section style={styles.aiIntelligenceCard}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIcon, ...styles.cardIconBlue }}>
                <i className="fa-solid fa-sparkles"></i>
              </div>
              <div>
                <h3 style={styles.cardTitle}>✨ AI 비즈니스 프로필 최적화</h3>
                <p style={styles.cardDescription}>Gemini AI가 당신의 직무에 최적화된 커뮤니케이션 가이드를 생성합니다.</p>
              </div>
            </div>

            <div>
              <label style={styles.label}>내 직무 및 상황 설명</label>
              <textarea 
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="예: '외국계 IT 기업의 프로젝트 매니저입니다. 주로 정중하면서도 명확한 업무 지시와 일정 조율이 필요합니다.'"
                style={{ ...styles.inputBox, minHeight: '96px', resize: 'vertical' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                {aiOptimizeStatus === 'loading' && (
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    AI가 최적의 프로필을 분석 중입니다...
                  </div>
                )}
                {aiOptimizeError && (
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>{aiOptimizeError}</div>
                )}
              </div>
              <button
                onClick={handleAiOptimize}
                disabled={aiOptimizeStatus === 'loading'}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: aiOptimizeStatus === 'loading' ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (aiOptimizeStatus !== 'loading') e.currentTarget.style.background = '#1d4ed8' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb' }}
              >
                ✨ AI로 프로필 최적화하기
              </button>
            </div>

            {aiOptimizeResult && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  추천 시스템 프롬프트
                </div>
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {aiOptimizeResult}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Translation Settings */}
        {activeMenu === 'translation' && (
          <section style={styles.settingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <i className="fa-solid fa-language"></i>
              </div>
              <div>
                <h3 style={styles.cardTitle}>번역 엔진 설정</h3>
                <p style={styles.cardDescription}>기본 번역 언어 및 옵션을 설정합니다.</p>
              </div>
            </div>

            <div>
              <label style={styles.label}>기본 타겟 언어</label>
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
                style={styles.select}
              >
                <option value="ko">한국어 (Korean)</option>
                <option value="en">영어 (English)</option>
                <option value="ja">일본어 (Japanese)</option>
                <option value="zh-CN">중국어 (Chinese)</option>
              </select>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                단축키를 통한 즉시 번역 시 이 언어가 기본값으로 사용됩니다.
              </p>
            </div>
          </section>
        )}

        {/* Shortcuts Settings */}
        {activeMenu === 'shortcuts' && (
          <section style={styles.settingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <i className="fa-solid fa-keyboard"></i>
              </div>
              <div>
                <h3 style={styles.cardTitle}>시스템 단축키 안내</h3>
                <p style={styles.cardDescription}>BCA에서 사용할 수 있는 키보드 단축키입니다.</p>
              </div>
            </div>

            <div>
              {[
                { name: '_execute_action', label: '팝업 열기 (클립보드 톤 변환)' },
                { name: 'tone-conversion', label: '클립보드 텍스트를 정중한 문장으로 변환 (팝업)' },
                { name: 'instant-translation', label: '선택한 텍스트 즉시 번역' },
                { name: 'instant-tone-conversion', label: '선택한 텍스트 즉시 정중한 문장 변환' },
              ].map((item) => {
                const cmd = commands.find(c => c.name === item.name)
                const isSet = !!cmd?.shortcut
                const keys = parseShortcut(cmd?.shortcut || '')

                return (
                  <div 
                    key={item.name}
                    style={{
                      ...styles.shortcutItem,
                      ...(isSet ? styles.shortcutSet : styles.shortcutNotSet)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: isSet ? '#d1fae5' : '#fef3c7',
                        color: isSet ? '#059669' : '#d97706'
                      }}>
                        {isSet ? (
                          <i className="fa-solid fa-check" style={{ fontSize: '12px' }}></i>
                        ) : (
                          <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: '12px' }}></i>
                        )}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: isSet ? '#334155' : '#92400e' }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSet ? (
                        keys.map((key, index) => (
                          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <kbd style={styles.kbd}>{key}</kbd>
                            {index < keys.length - 1 && (
                              <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500 }}>+</span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span style={{ 
                          padding: '6px 12px', 
                          background: 'rgba(254, 243, 199, 0.8)', 
                          border: '1px solid #fcd34d', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          color: '#92400e',
                          fontStyle: 'italic'
                        }}>
                          설정되지 않음
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={styles.proTipBox}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-keyboard"></i> Pro Tip
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  단축키가 다른 앱과 충돌하나요? 크롬 설정에서 자유롭게 변경할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
                style={{
                  background: '#ffffff',
                  color: '#2563eb',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0,
                }}
              >
                단축키 설정 바로가기
                <i className="fa-solid fa-external-link-alt" style={{ fontSize: '10px' }}></i>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SettingsPage
