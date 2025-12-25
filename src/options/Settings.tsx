import { useState, useEffect } from 'react'
import { 
  Loader2, CheckCircle, Settings, Cpu, Languages, 
  Keyboard, ShieldCheck, Info, MessageSquare, ExternalLink, Save,
  BarChart3, Calendar, Filter, TrendingUp, History, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectItem } from '@/components/ui/select'
import { StorageService } from '@/services/storage-service'
import { AIOrchestrator } from '@/services/ai/ai-orchestrator'
import { AI_MODELS } from '@/services/ai/models'
import { AIProvider, TargetLanguage, UsageLog } from '@/types'
import { encryptData, decryptData } from '@/utils/crypto'
import { useCommands } from '@/hooks/useCommands'

type ValidationState = 'idle' | 'testing' | 'success' | 'error'
type MenuId = 'general' | 'ai-engines' | 'translation' | 'shortcuts' | 'dashboard';

function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('ai-engines')
  const { commands } = useCommands()
  
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
    period: '7d' // 1d, 7d, 30d, all
  })
  
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
      
      setMessage('설정이 안전하게 저장되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Save error:', error)
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
      console.error('Test error:', err)
      setValidationState('error')
      setMessage('연결 테스트 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden text-zinc-900 font-sans">
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col shrink-0">
        <div className="p-8 border-b border-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">환경 설정</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <MenuButton active={activeMenu === 'ai-engines'} onClick={() => setActiveMenu('ai-engines')} icon={<Cpu className="w-4 h-4" />} label="AI 엔진 및 모델" />
          <MenuButton active={activeMenu === 'general'} onClick={() => setActiveMenu('general')} icon={<MessageSquare className="w-4 h-4" />} label="일반 및 톤 설정" />
          <MenuButton active={activeMenu === 'translation'} onClick={() => setActiveMenu('translation')} icon={<Languages className="w-4 h-4" />} label="번역 환경 설정" />
          <MenuButton active={activeMenu === 'shortcuts'} onClick={() => setActiveMenu('shortcuts')} icon={<Keyboard className="w-4 h-4" />} label="단축키 관리" />
        </nav>

        <div className="p-6 border-t border-zinc-100">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
            <div className="flex items-center gap-2 text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              Privacy Secured
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed whitespace-nowrap">모든 데이터는 로컬에 암호화되어 저장됩니다.</p>
          </div>
          <div className="mt-4 px-1">
            <p className="text-[11px] text-zinc-400 font-medium">© 2020 SIREAL</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 relative">
        <div className="max-w-6xl mx-auto p-12 pb-32">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-900 capitalize">
                {activeMenu === 'general' && '일반 설정'}
                {activeMenu === 'ai-engines' && 'AI 엔진 구성'}
                {activeMenu === 'translation' && '번역 설정'}
                {activeMenu === 'shortcuts' && '단축키 가이드'}
              </h2>
              <p className="text-lg text-zinc-500 mt-1">BCA 어시스턴트의 동작 방식을 세밀하게 조정합니다.</p>
            </div>
            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl px-6 font-bold shadow-xl shadow-zinc-200 gap-2 h-11 transition-all active:scale-95 text-base">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              설정 저장하기
            </Button>
          </div>

          {message && (
            <Alert className={`mb-8 border-none shadow-sm rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-500 ${validationState === 'error' ? 'bg-red-50 text-red-700' : 'bg-zinc-900 text-white'}`}>
              <div className="flex items-center gap-3">
                {validationState === 'success' ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                <AlertDescription className="text-base font-bold">{message}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeMenu === 'general' && (
              <>
                <Section title="자동화 환경">
                  <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-8">
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 transition-colors">
                      <Checkbox id="auto-copy" checked={autoCopyEnabled} onCheckedChange={(v) => setAutoCopyEnabledState(!!v)} className="mt-1.5" />
                      <div className="space-y-1.5">
                        <label htmlFor="auto-copy" className="text-lg font-bold cursor-pointer text-zinc-900">변환 완료 시 결과물 자동 복사</label>
                        <p className="text-base text-zinc-500 leading-relaxed">팝업에서 톤 변환이 완료되면 즉시 클립보드에 저장합니다.</p>
                      </div>
                    </div>
                    {autoCopyEnabled && (
                      <div className="px-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">우선 복사할 스타일</label>
                        <Select value={autoCopyTone} onValueChange={(v) => setAutoCopyToneState(v as any)}>
                          <SelectItem value="formal" className="text-base">비즈니스 이메일 (격식)</SelectItem>
                          <SelectItem value="general" className="text-base">사내 메신저 (일반)</SelectItem>
                          <SelectItem value="friendly" className="text-base">캐주얼 채팅 (친근)</SelectItem>
                        </Select>
                      </div>
                    )}
                  </div>
                </Section>
                <Section title="선택한 텍스트 즉시 정중한 문장 변환">
                  <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-8">
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 transition-colors">
                      <Keyboard className="w-6 h-6 text-zinc-400 mt-1.5" />
                      <div className="space-y-1.5">
                        <h4 className="text-lg font-bold text-zinc-900">즉시 정중한 문장 변환 설정</h4>
                        <p className="text-base text-zinc-500 leading-relaxed">
                          텍스트를 선택하고 단축키(기본: <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[13px] font-black mx-0.5">
                            {commands.find(c => c.name === 'instant-tone-conversion')?.shortcut || '설정되지 않음'}
                          </kbd>)를 누르면, 즉시 교체됩니다.
                        </p>
                      </div>
                    </div>
                    <div className="px-2 space-y-3">
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">적용할 스타일</label>
                      <Select value={instantToneStyle} onValueChange={(v) => setInstantToneStyleState(v as any)}>
                        <SelectItem value="formal" className="text-base">비즈니스 이메일 (격식)</SelectItem>
                        <SelectItem value="general" className="text-base">사내 메신저 (일반)</SelectItem>
                        <SelectItem value="friendly" className="text-base">캐주얼 채팅 (친근)</SelectItem>
                      </Select>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {activeMenu === 'ai-engines' && (
              <div className="space-y-8">
                <Section title="엔진 및 API 통합 구성">
                  <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-8">
                    <div className="flex flex-row items-end gap-6 w-full">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">활성 엔진</label>
                        <Select value={selectedProvider} onValueChange={(v) => setSelectedProviderState(v as AIProvider)}>
                          <SelectItem value="gemini" className="text-base">Google Gemini</SelectItem>
                          <SelectItem value="chatgpt" className="text-base">OpenAI GPT</SelectItem>
                          <SelectItem value="claude" className="text-base">Anthropic Claude</SelectItem>
                        </Select>
                      </div>
                      <div className="flex-[1.5] space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">상세 모델</label>
                        <Select value={providerModels[selectedProvider]} onValueChange={(v) => setProviderModels(prev => ({ ...prev, [selectedProvider]: v }))}>
                          {AI_MODELS[selectedProvider].map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} (${m.pricePer1M.toFixed(2)} / 1M)
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="flex-[2] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">API KEY</label>
                          <button onClick={handleTestConnection} disabled={validationState === 'testing'} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                            {validationState === 'testing' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ExternalLink className="w-2.5 h-2.5" />}
                            연결 테스트
                          </button>
                        </div>
                        <Input type="password" value={apiKeys[selectedProvider]} onChange={(e) => setApiKeys(prev => ({ ...prev, [selectedProvider]: e.target.value }))} placeholder="인증 키를 입력하세요" className="h-11 bg-zinc-50 border-zinc-200 font-mono text-base rounded-xl focus:bg-white transition-all" />
                      </div>
                    </div>
                  </div>
                </Section>


                <Section title="사용량 분석 대시보드">
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[120px] space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> 엔진
                        </label>
                        <Select value={dashboardFilter.provider} onValueChange={(v) => setDashboardFilter(prev => ({ ...prev, provider: v }))}>
                          <SelectItem value="all" className="text-base">전체 엔진</SelectItem>
                          <SelectItem value="gemini" className="text-base">Gemini</SelectItem>
                          <SelectItem value="chatgpt" className="text-base">OpenAI</SelectItem>
                          <SelectItem value="claude" className="text-base">Claude</SelectItem>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                          <Filter className="w-3 h-3" /> 태스크
                        </label>
                        <Select value={dashboardFilter.task} onValueChange={(v) => setDashboardFilter(prev => ({ ...prev, task: v }))}>
                          <SelectItem value="all" className="text-base">전체 작업</SelectItem>
                          <SelectItem value="tone-conversion" className="text-base">톤 변환</SelectItem>
                          <SelectItem value="translation" className="text-base">번역</SelectItem>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-1.5">
                        <label className="text-[12px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 기간
                        </label>
                        <Select value={dashboardFilter.period} onValueChange={(v) => setDashboardFilter(prev => ({ ...prev, period: v }))}>
                          <SelectItem value="1d" className="text-base">오늘</SelectItem>
                          <SelectItem value="7d" className="text-base">최근 7일</SelectItem>
                          <SelectItem value="30d" className="text-base">최근 한달</SelectItem>
                          <SelectItem value="all" className="text-base">전체</SelectItem>
                        </Select>
                      </div>
                      <Button variant="ghost" size="icon" className="mt-4 rounded-xl border border-zinc-100" onClick={() => setDashboardFilter({ provider: 'all', model: 'all', task: 'all', period: '7d' })}>
                        <History className="w-4 h-4 text-zinc-400" />
                      </Button>
                    </div>

                    {/* Charts / KPIs */}
                    <div className="grid grid-cols-4 gap-4">
                      <DashboardKPI label="총 호출" value={`${filteredLogs.length}회`} icon={<TrendingUp className="w-3 h-3" />} />
                      <DashboardKPI label="총 비용" value={`$${filteredLogs.reduce((acc, curr) => acc + (curr.cost || 0), 0).toFixed(4)}`} icon={<BarChart3 className="w-3 h-3" />} />
                      <DashboardKPI label="평균 응답" value="1.2s" icon={<Loader2 className="w-3 h-3" />} />
                      <DashboardKPI label="추정 토큰" value={`${Math.round(filteredLogs.reduce((acc, curr) => acc + (curr.inputTokens || 0) + (curr.outputTokens || 0), 0) / 1000)}K`} icon={<Cpu className="w-3 h-3" />} />
                    </div>

                    {/* Simple Bar Chart SVG */}
                    <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm h-64 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-base font-black flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> 일별 사용량 추이
                        </h4>
                      </div>
                      <div className="flex-1 flex items-end justify-between gap-2 px-2 border-b border-zinc-100 pb-2">
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
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[12px] px-2 py-1 rounded-md font-bold mb-1">
                                {count}회
                              </div>
                              <div className="w-full bg-zinc-100 rounded-t-lg group-hover:bg-zinc-200 transition-colors" style={{ height: `${height || 5}%` }}>
                                <div className="w-full bg-zinc-900 rounded-t-lg transition-all duration-700" style={{ height: `${height}%` }} />
                              </div>
                              <span className="text-[11px] text-zinc-400 font-bold mt-2">{date.getDate()}일</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <h4 className="text-base font-black flex items-center gap-2">
                          <History className="w-4 h-4" /> 상세 실행 로그
                        </h4>
                        <Button variant="ghost" size="sm" className="text-[12px] font-bold gap-1 text-zinc-400">
                          <Download className="w-3 h-3" /> 내보내기
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-base">
                          <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 uppercase tracking-widest font-black">
                            <tr>
                              <th className="px-6 py-4">일시</th>
                              <th className="px-6 py-4">엔진/모델</th>
                              <th className="px-6 py-4">작업</th>
                              <th className="px-6 py-4">토큰(In/Out)</th>
                              <th className="px-6 py-4">비용</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {filteredLogs.slice(0, 10).map((log, i) => (
                              <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-zinc-500">{new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900 uppercase">{log.provider}</span>
                                    <span className="text-sm text-zinc-400">{log.model}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-md font-bold text-sm ${log.task === 'tone-conversion' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {log.task === 'tone-conversion' ? '톤 변환' : '번역'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-zinc-500">{log.inputTokens}/{log.outputTokens}</td>
                                <td className="px-6 py-4 font-bold text-zinc-900">${(log.cost || 0).toFixed(6)}</td>
                              </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium italic text-base">데이터가 존재하지 않습니다.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {activeMenu === 'translation' && (
              <Section title="번역 엔진 설정">
                <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-base font-bold ml-1">기본 타겟 언어</label>
                    <Select value={targetLang} onValueChange={(v) => setTargetLang(v as TargetLanguage)}>
                      <SelectItem value="ko" className="text-base">한국어 (Korean)</SelectItem>
                      <SelectItem value="en" className="text-base">영어 (English)</SelectItem>
                      <SelectItem value="ja" className="text-base">일본어 (Japanese)</SelectItem>
                      <SelectItem value="zh-CN" className="text-base">중국어 (Chinese)</SelectItem>
                    </Select>
                    <p className="text-sm text-zinc-400 ml-1">단축키를 통한 즉시 번역 시 이 언어가 기본값으로 사용됩니다.</p>
                  </div>
                </div>
              </Section>
            )}

            {activeMenu === 'shortcuts' && (
              <Section title="시스템 단축키 안내">
                <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 gap-4">
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
                          <ShortcutItem 
                            key={name}
                            label={getLabel(name)}
                            shortcut={cmd?.shortcut || ''} 
                          />
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-6 p-8 bg-zinc-900 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-zinc-400 font-bold text-sm uppercase tracking-widest">
                        <Keyboard className="w-5 h-5 text-white" />
                        Pro Tip
                      </div>
                      <p className="text-lg leading-relaxed font-medium">
                        단축키가 다른 앱과 충돌하나요? 크롬 설정에서 자유롭게 변경할 수 있습니다.
                      </p>
                    </div>
                    <Button 
                      onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
                      className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl px-6 font-bold h-12 gap-2 shrink-0 transition-all active:scale-95 shadow-lg shadow-white/10 text-base"
                    >
                      단축키 설정 바로가기
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

interface MenuButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function MenuButton({ active, onClick, icon, label }: MenuButtonProps) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 ${active ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200 translate-x-1' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}>
      {icon}
      {label}
    </button>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-black text-zinc-400 uppercase tracking-[0.2em] px-1">{title}</h3>
      {children}
    </div>
  )
}

function ShortcutItem({ label, shortcut }: { label: string, shortcut: string }) {
  const isNotSet = !shortcut;
  
  return (
    <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
      <span className="text-lg font-bold text-zinc-700">{label}</span>
      <div className="flex gap-2">
        <kbd className={`px-3 py-1.5 border rounded-lg text-sm font-black shadow-sm ${
          isNotSet 
            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 italic font-medium' 
            : 'bg-white border-zinc-200 text-zinc-500'
        }`}>
          {isNotSet ? '설정되지 않음' : shortcut}
        </kbd>
      </div>
    </div>
  )
}

interface DashboardKPIProps {
  label: string
  value: string
  icon: React.ReactNode
}

function DashboardKPI({ label, value, icon }: DashboardKPIProps) {
  return (
    <div className="p-5 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black text-zinc-900">{value}</div>
    </div>
  )
}

export default SettingsPage
