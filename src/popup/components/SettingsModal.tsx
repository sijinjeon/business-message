import React, { useState, useEffect } from 'react'
import { 
  Loader2, CheckCircle, Settings, Cpu, Languages, 
  Keyboard, ShieldCheck, Info, MessageSquare, ExternalLink, Save,
  BarChart3, TrendingUp, History, PieChart, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectItem } from '@/components/ui/select'
import { StorageService } from '@/services/storage-service'
import { AIOrchestrator } from '@/services/ai/ai-orchestrator'
import { AI_MODELS } from '@/services/ai/models'
import { AIProvider, TargetLanguage, UsageLog } from '@/types'
import { encryptData, decryptData } from '@/utils/crypto'
import { useCommands } from '@/hooks/useCommands'

type ValidationState = 'idle' | 'testing' | 'success' | 'error'
type MenuId = 'ai-engines' | 'dashboard' | 'general' | 'translation' | 'shortcuts';

interface SettingsModalProps {
  onClose?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeMenu, setActiveMenu] = useState<MenuId>('ai-engines')
  const { commands } = useCommands()
  
  // AI 설정 상태
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>('gemini')
  const [apiKeys, setApiKeys] = useState({ gemini: '', chatgpt: '', claude: '' })
  const [providerModels, setProviderModels] = useState({ gemini: '', chatgpt: '', claude: '' })
  
  // 사용량 데이터 상태
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  
  // 기능 설정 상태
  const [autoCopyEnabled, setAutoCopyEnabledState] = useState(true)
  const [autoCopyTone, setAutoCopyToneState] = useState<'formal' | 'general' | 'friendly'>('formal')
  const [instantToneStyle, setInstantToneStyleState] = useState<'formal' | 'general' | 'friendly'>('formal')
  const [targetLang, setTargetLang] = useState<TargetLanguage>('ko')
  
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
      
      setMessage('설정이 안전하게 저장되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    if (!currentApiKey.trim()) {
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
    } catch (err) {
      setValidationState('error')
      setMessage('연결 테스트 중 오류가 발생했습니다.')
    }
  }

  const stats = {
    today: usageLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    week: usageLogs.filter(l => Date.now() - l.timestamp < 7 * 24 * 60 * 60 * 1000).length,
    totalCost: usageLogs.reduce((acc, curr) => acc + (curr.cost || 0), 0)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'ai-engines':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-zinc-400 uppercase tracking-widest ml-1">활성 엔진</label>
                <Select value={selectedProvider} onValueChange={(v) => setSelectedProviderState(v as AIProvider)}>
                  <SelectItem value="gemini" className="text-base">Google Gemini</SelectItem>
                  <SelectItem value="chatgpt" className="text-base">OpenAI GPT</SelectItem>
                  <SelectItem value="claude" className="text-base">Anthropic Claude</SelectItem>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-zinc-400 uppercase tracking-widest ml-1">상세 모델</label>
                <Select value={providerModels[selectedProvider]} onValueChange={(v) => setProviderModels(prev => ({ ...prev, [selectedProvider]: v }))}>
                  {AI_MODELS[selectedProvider].map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} (${m.pricePer1M.toFixed(2)} / 1M)
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-black text-zinc-400 uppercase tracking-widest ml-1">API KEY</label>
                  <button onClick={handleTestConnection} disabled={validationState === 'testing'} className="text-[12px] font-black text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1">
                    {validationState === 'testing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ExternalLink className="w-2.5 h-2.5" />}
                    연결 테스트
                  </button>
                </div>
                <Input type="password" value={apiKeys[selectedProvider]} onChange={(e) => setApiKeys(prev => ({ ...prev, [selectedProvider]: e.target.value }))} placeholder="인증 키를 입력하세요" className="bg-zinc-50 border-zinc-100 font-mono text-base rounded-xl focus:bg-white h-11" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <UsageCard label="오늘" value={`${stats.today}회`} icon={<TrendingUp className="w-3 h-3" />} />
              <UsageCard label="최근 7일" value={`${stats.week}회`} icon={<History className="w-3 h-3" />} />
              <UsageCard label="누적 비용" value={`$${stats.totalCost.toFixed(4)}`} icon={<BarChart3 className="w-3 h-3" />} />
            </div>
          </div>
        )
      case 'dashboard':
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-zinc-900 rounded-[24px] text-white space-y-1 shadow-lg shadow-zinc-200">
                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">총 실행 횟수</span>
                <div className="text-3xl font-black">{usageLogs.length}회</div>
              </div>
              <div className="p-4 bg-white rounded-[24px] border border-zinc-100 space-y-1 shadow-sm">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">총 추정 비용</span>
                <div className="text-3xl font-black text-zinc-900">${stats.totalCost.toFixed(4)}</div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden h-64 flex flex-col items-center justify-center text-zinc-300">
              <PieChart className="w-12 h-12 mb-3 opacity-20" />
              <span className="text-base font-bold tracking-tight">상세 대시보드는 준비 중입니다.</span>
            </div>
          </div>
        )
      case 'general':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-5 bg-white rounded-[28px] border border-zinc-100 shadow-sm space-y-5">
              <div className="flex items-start gap-4">
                <Checkbox id="auto-copy" checked={autoCopyEnabled} onCheckedChange={(v) => setAutoCopyEnabledState(!!v)} className="mt-1" />
                <div className="space-y-1">
                  <label htmlFor="auto-copy" className="text-base font-bold cursor-pointer">변환 시 자동 복사</label>
                  <p className="text-[13px] text-zinc-400 font-medium">변환이 완료되면 즉시 클립보드에 저장합니다.</p>
                </div>
              </div>
              {autoCopyEnabled && (
                <div className="pl-9 space-y-2">
                  <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">기본 복사 톤</label>
                  <Select value={autoCopyTone} onValueChange={(v) => setAutoCopyToneState(v as any)}>
                    <SelectItem value="formal" className="text-base">격식 (Formal)</SelectItem>
                    <SelectItem value="general" className="text-base">일반 (General)</SelectItem>
                    <SelectItem value="friendly" className="text-base">친근 (Friendly)</SelectItem>
                  </Select>
                </div>
              )}
            </div>
            <div className="p-5 bg-white rounded-[28px] border border-zinc-100 shadow-sm space-y-4">
              <label className="text-base font-bold block ml-1">즉시 정중한 문장 변환 스타일</label>
              <Select value={instantToneStyle} onValueChange={(v) => setInstantToneStyleState(v as any)}>
                <SelectItem value="formal" className="text-base">격식 (Formal)</SelectItem>
                <SelectItem value="general" className="text-base">일반 (General)</SelectItem>
                <SelectItem value="friendly" className="text-base">친근 (Friendly)</SelectItem>
              </Select>
            </div>
          </div>
        )
      case 'translation':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-6 bg-white rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
              <label className="text-base font-bold block ml-1">기본 타겟 언어</label>
              <Select value={targetLang} onValueChange={(v) => setTargetLang(v as TargetLanguage)}>
                <SelectItem value="ko" className="text-base">한국어 (Korean)</SelectItem>
                <SelectItem value="en" className="text-base">영어 (English)</SelectItem>
                <SelectItem value="ja" className="text-base">일본어 (Japanese)</SelectItem>
                <SelectItem value="zh-CN" className="text-base">중국어 (Chinese)</SelectItem>
              </Select>
              <p className="text-[13px] text-zinc-400 leading-relaxed font-medium px-1">
                텍스트 선택 후 즉시 번역 기능을 실행할 때 사용되는 기본 언어 설정입니다.
              </p>
            </div>
          </div>
        )
      case 'shortcuts':
        return (
          <div className="space-y-3 animate-in fade-in duration-300">
            {(() => {
              const orderedNames = [
                '_execute_action',
                'tone-conversion',
                'instant-translation',
                'instant-tone-conversion'
              ];
              
              const getLabel = (name: string) => {
                switch(name) {
                  case '_execute_action': return '클립보드 텍스트를 번역(팝업)';
                  case 'tone-conversion': return '클립보드 텍스트를 정중한 문장으로 변환 (팝업)';
                  case 'instant-translation': return '선택한 텍스트 즉시 번역';
                  case 'instant-tone-conversion': return '선택한 텍스트 즉시 정중한 문장 변환';
                  default: return name;
                }
              };

              return orderedNames.map(name => {
                const cmd = commands.find(c => c.name === name);
                return (
                  <ShortcutRow 
                    key={name}
                    label={getLabel(name)}
                    keycap={cmd?.shortcut || ''} 
                  />
                );
              });
            })()}
            <div className="mt-4 p-5 bg-zinc-900 rounded-[24px] text-zinc-400 text-[13px] leading-relaxed font-medium">
              <span className="text-white font-black block mb-1">💡 단축키 변경 안내</span>
              크롬 설정(<span className="text-zinc-200">chrome://extensions/shortcuts</span>)에서 원하는 키로 자유롭게 변경 가능합니다.
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="w-[600px] h-[700px] bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex relative ring-1 ring-black/5">
        
        {/* Sidebar (180px) */}
        <aside className="w-[180px] bg-zinc-50/80 border-r border-zinc-100 flex flex-col shrink-0 p-5">
          <div className="mb-8 px-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
                <Settings className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-black tracking-tight">Settings</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <SideMenu active={activeMenu === 'ai-engines'} onClick={() => setActiveMenu('ai-engines')} icon={<Cpu className="w-3.5 h-3.5" />} label="AI 엔진 및 모델" />
            <SideMenu active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} icon={<BarChart3 className="w-3.5 h-3.5" />} label="사용량 대시보드" />
            <SideMenu active={activeMenu === 'general'} onClick={() => setActiveMenu('general')} icon={<MessageSquare className="w-3.5 h-3.5" />} label="일반 및 톤 설정" />
            <SideMenu active={activeMenu === 'translation'} onClick={() => setActiveMenu('translation')} icon={<Languages className="w-3.5 h-3.5" />} label="번역 환경 설정" />
            <SideMenu active={activeMenu === 'shortcuts'} onClick={() => setActiveMenu('shortcuts')} icon={<Keyboard className="w-3.5 h-3.5" />} label="단축키 관리" />
          </nav>

          <div className="mt-auto">
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-100 space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
                Privacy Secured
              </div>
              <p className="text-[10.5px] text-zinc-400 leading-tight font-medium break-keep-all">모든 데이터는 로컬에 암호화 보관됩니다.</p>
            </div>
          </div>
        </aside>

        {/* Main Content (420px) */}
        <main className="flex-1 flex flex-col bg-white">
          <header className="px-7 py-6 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 capitalize">
                {activeMenu === 'ai-engines' && 'AI 엔진 구성'}
                {activeMenu === 'dashboard' && '실행 분석'}
                {activeMenu === 'general' && '일반 설정'}
                {activeMenu === 'translation' && '번역 엔진'}
                {activeMenu === 'shortcuts' && '단축키 가이드'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveAll} disabled={isSaving} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl px-4 h-9 font-black text-sm transition-all active:scale-95 shadow-lg shadow-zinc-200">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                저장
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-zinc-100 h-9 w-9">
                <X className="w-4 h-4 text-zinc-400" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-7 pb-10 custom-scrollbar">
            {message && (
              <div className={`mb-6 p-3.5 rounded-2xl text-[14px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${validationState === 'error' ? 'bg-red-50 text-red-600' : 'bg-zinc-900 text-white shadow-xl'}`}>
                {validationState === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                {message}
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

interface SideMenuProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function SideMenu({ active, onClick, icon, label }: SideMenuProps) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-black transition-all duration-200 active:scale-95 break-keep-all text-left ${active ? 'bg-zinc-900 text-white shadow-md shadow-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}>
      {icon}
      {label}
    </button>
  )
}

interface UsageCardProps {
  label: string
  value: string
  icon: React.ReactNode
}

function UsageCard({ label, value, icon }: UsageCardProps) {
  return (
    <div className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100/50 flex flex-col items-center justify-center text-center space-y-1">
      <div className="text-zinc-400 mb-0.5">{icon}</div>
      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
      <span className="text-base font-black text-zinc-900">{value}</span>
    </div>
  )
}

function ShortcutRow({ label, keycap }: { label: string, keycap: string }) {
  const isNotSet = !keycap;
  
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100/50">
      <span className="text-sm font-bold text-zinc-700">{label}</span>
      <kbd className={`px-2 py-1 border rounded-lg text-[11px] font-black shadow-sm uppercase tracking-tighter ${
        isNotSet 
          ? 'bg-zinc-100 border-zinc-200 text-zinc-400 italic font-medium' 
          : 'bg-white border-zinc-200 text-zinc-500'
      }`}>
        {isNotSet ? '설정되지 않음' : keycap}
      </kbd>
    </div>
  )
}

export default SettingsModal

