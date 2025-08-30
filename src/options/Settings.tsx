import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { saveApiKey, getApiKey } from '@/utils/storage'
import { validateApiKey } from '@/utils/api'

type ValidationState = 'idle' | 'testing' | 'success' | 'error'

function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    loadApiKey()
  }, [])
  
  const loadApiKey = async () => {
    try {
      const savedKey = await getApiKey()
      if (savedKey) {
        setApiKey(savedKey)
      }
    } catch (error) {
      console.error('Failed to load API key:', error)
    }
  }
  
  const handleTest = async () => {
    if (!apiKey.trim()) {
      setMessage('API 키를 입력해주세요.')
      return
    }
    
    setValidationState('testing')
    setMessage('')
    
    try {
      const isValid = await validateApiKey(apiKey.trim())
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
    if (!apiKey.trim()) {
      setMessage('API 키를 입력해주세요.')
      return
    }
    
    setIsSaving(true)
    setMessage('')
    
    try {
      await saveApiKey(apiKey.trim())
      setMessage('API 키가 저장되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">설정</h1>
        <p className="text-muted-foreground">
          정중한 문장 도우미를 사용하기 위해 Google Gemini API 키를 설정해주세요.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Google Gemini API 키 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API 키</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Google AI Studio에서 발급받은 API 키를 입력하세요"
              className="font-mono"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={validationState === 'testing' || !apiKey.trim()}
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
              disabled={isSaving || !apiKey.trim()}
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
          <CardTitle>API 키 발급 방법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>개인정보 보호:</strong> 입력된 API 키는 암호화되어 브라우저에만 저장되며, 
              외부 서버로 전송되지 않습니다. 변환할 텍스트 역시 Google AI 서비스로만 전송되며 
              별도로 저장되지 않습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings