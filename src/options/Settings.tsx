import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectItem } from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { 
  saveApiKey, 
  getApiKey, 
  getAutoCopyEnabled, 
  setAutoCopyEnabled, 
  getAutoCopyTone, 
  setAutoCopyTone,
  getSelectedProvider,
  setSelectedProvider
} from '@/utils/storage'
import { validateApiKey, AI_PROVIDERS } from '@/utils/api'
import { AIProvider } from '@/types'

type ValidationState = 'idle' | 'testing' | 'success' | 'error'

function Settings() {
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>('gemini')
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    chatgpt: '',
    claude: ''
  })
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [autoCopyEnabled, setAutoCopyEnabledState] = useState(true)
  const [autoCopyTone, setAutoCopyToneState] = useState<'formal' | 'general' | 'friendly'>('formal')
  
  useEffect(() => {
    loadSettings()
  }, [])
  
  const loadSettings = async () => {
    try {
      const provider = await getSelectedProvider()
      const geminiKey = await getApiKey('gemini')
      const chatgptKey = await getApiKey('chatgpt')
      const claudeKey = await getApiKey('claude')
      const autoCopy = await getAutoCopyEnabled()
      const copyTone = await getAutoCopyTone()
      
      setSelectedProviderState(provider)
      setApiKeys({
        gemini: geminiKey,
        chatgpt: chatgptKey,
        claude: claudeKey
      })
      setAutoCopyEnabledState(autoCopy)
      setAutoCopyToneState(copyTone)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  
  const handleProviderChange = async (provider: string) => {
    const newProvider = provider as AIProvider
    setSelectedProviderState(newProvider)
    try {
      await setSelectedProvider(newProvider)
    } catch (error) {
      console.error('Failed to save provider setting:', error)
    }
  }
  
  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }
  
  const handleTest = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    
    if (!currentApiKey.trim()) {
      setMessage('API 키를 입력해주세요.')
      return
    }
    
    setValidationState('testing')
    setMessage('')
    
    try {
      const isValid = await validateApiKey(selectedProvider, currentApiKey.trim())
      if (isValid) {
        setValidationState('success')
        setMessage('API 키가 유효합니다!')
      } else {
        setValidationState('error')
        setMessage('유효하지 않은 API 키입니다. 다시 확인해주세요.')
      }
    } catch (error) {
      setValidationState('error')
      setMessage('연결 테스트 중 오류가 발생했습니다.')
    }
  }
  
  const handleSave = async () => {
    const currentApiKey = apiKeys[selectedProvider]
    
    if (!currentApiKey.trim()) {
      setMessage('API 키를 입력해주세요.')
      return
    }
    
    setIsSaving(true)
    setMessage('')
    
    try {
      await saveApiKey(selectedProvider, currentApiKey.trim())
      await setAutoCopyEnabled(autoCopyEnabled)
      await setAutoCopyTone(autoCopyTone)
      setMessage('설정이 저장되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleAutoCopyToggle = async (enabled: boolean) => {
    setAutoCopyEnabledState(enabled)
    try {
      await setAutoCopyEnabled(enabled)
    } catch (error) {
      console.error('Failed to save auto copy setting:', error)
    }
  }
  
  const handleAutoCopyToneChange = async (value: string) => {
    const tone = value as 'formal' | 'general' | 'friendly'
    setAutoCopyToneState(tone)
    try {
      await setAutoCopyTone(tone)
    } catch (error) {
      console.error('Failed to save auto copy tone:', error)
    }
  }
  
  const currentProvider = AI_PROVIDERS[selectedProvider]
  const currentApiKey = apiKeys[selectedProvider]
  
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">설정</h1>
        <p className="text-muted-foreground">
          정중한 문장 도우미를 사용하기 위해 AI 제공업체를 선택하고 API 키를 설정해주세요.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI 제공업체 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI 제공업체</label>
            <Select
              value={selectedProvider}
              onValueChange={handleProviderChange}
            >
              <SelectItem value="gemini">
                {AI_PROVIDERS.gemini.name} - {AI_PROVIDERS.gemini.description}
              </SelectItem>
              <SelectItem value="chatgpt">
                {AI_PROVIDERS.chatgpt.name} - {AI_PROVIDERS.chatgpt.description}
              </SelectItem>
              <SelectItem value="claude">
                {AI_PROVIDERS.claude.name} - {AI_PROVIDERS.claude.description}
              </SelectItem>
            </Select>
            <p className="text-xs text-muted-foreground">
              현재 모델: {currentProvider.model}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{currentProvider.name} API 키 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API 키</label>
            <Input
              type="password"
              value={currentApiKey}
              onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
              placeholder={`${currentProvider.name} API 키를 입력하세요`}
              className="font-mono"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={validationState === 'testing' || !currentApiKey.trim()}
            >
              {validationState === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  연결 테스트 중...
                </>
              ) : (
                '연결 테스트'
              )}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving || !currentApiKey.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </div>
          
          {message && (
            <Alert variant={validationState === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-center gap-2">
                {validationState === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {validationState === 'error' && <XCircle className="w-4 h-4" />}
                <AlertDescription>{message}</AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>자동 복사 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="auto-copy"
              checked={autoCopyEnabled}
              onCheckedChange={handleAutoCopyToggle}
            />
            <div className="space-y-1">
              <label 
                htmlFor="auto-copy" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                변환 완료 시 결과를 자동으로 클립보드에 복사
              </label>
              <p className="text-xs text-muted-foreground">
                활성화하면 변환이 완료될 때 선택한 톤의 결과가 자동으로 클립보드에 복사됩니다.
              </p>
            </div>
          </div>
          
          {autoCopyEnabled && (
            <div className="space-y-2 ml-7">
              <label className="text-sm font-medium">자동 복사할 톤 선택</label>
              <Select
                value={autoCopyTone}
                onValueChange={handleAutoCopyToneChange}
              >
                <SelectItem value="formal">비즈니스 이메일</SelectItem>
                <SelectItem value="general">사내 메신저</SelectItem>
                <SelectItem value="friendly">캐주얼 채팅</SelectItem>
              </Select>
              <p className="text-xs text-muted-foreground">
                변환 완료 시 선택한 톤의 결과가 자동으로 클립보드에 복사됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API 키 발급 방법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedProvider === 'gemini' && (
            <div className="space-y-3">
              <h4 className="font-medium">Google Gemini API 키 발급</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <a 
                    href="https://ai.google.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>에 접속합니다.
                </li>
                <li>Google 계정으로 로그인합니다.</li>
                <li>"Get API Key" 버튼을 클릭합니다.</li>
                <li>"Create API Key" 를 선택하여 새 API 키를 생성합니다.</li>
                <li>생성된 API 키를 복사하여 위 입력란에 붙여넣습니다.</li>
              </ol>
            </div>
          )}
          
          {selectedProvider === 'chatgpt' && (
            <div className="space-y-3">
              <h4 className="font-medium">OpenAI API 키 발급</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>에 접속합니다.
                </li>
                <li>OpenAI 계정으로 로그인합니다.</li>
                <li>"Create new secret key" 버튼을 클릭합니다.</li>
                <li>키 이름을 입력하고 "Create secret key"를 클릭합니다.</li>
                <li>생성된 API 키를 복사하여 위 입력란에 붙여넣습니다.</li>
              </ol>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>주의:</strong> OpenAI API는 유료 서비스입니다. 사용량에 따라 요금이 부과됩니다.
                </p>
              </div>
            </div>
          )}
          
          {selectedProvider === 'claude' && (
            <div className="space-y-3">
              <h4 className="font-medium">Anthropic Claude API 키 발급</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <a 
                    href="https://console.anthropic.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Anthropic Console
                  </a>에 접속합니다.
                </li>
                <li>Anthropic 계정으로 로그인합니다.</li>
                <li>좌측 메뉴에서 "API Keys"를 클릭합니다.</li>
                <li>"Create Key" 버튼을 클릭합니다.</li>
                <li>생성된 API 키를 복사하여 위 입력란에 붙여넣습니다.</li>
              </ol>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>주의:</strong> Claude API는 유료 서비스입니다. 사용량에 따라 요금이 부과됩니다.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>개인정보 보호:</strong> 입력된 API 키는 암호화되어 브라우저에만 저장되며, 
              외부 서버로 전송되지 않습니다. 변환할 텍스트 역시 선택한 AI 서비스로만 전송되며 
              별도로 저장되지 않습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings