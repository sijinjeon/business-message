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
      setMessage('Please enter an API key.')
      return
    }

    setValidationState('testing')
    setMessage('')

    try {
      const isValid = await validateApiKey(selectedProvider, currentApiKey.trim())
      if (isValid) {
        setValidationState('success')
        setMessage('API key is valid!')
      } else {
        setValidationState('error')
        setMessage('Invalid API key. Please check again.')
      }
    } catch (error) {
      setValidationState('error')
      setMessage('Error occurred during connection test.')
    }
  }

  const handleSave = async () => {
    const currentApiKey = apiKeys[selectedProvider]

    if (!currentApiKey.trim()) {
      setMessage('Please enter an API key.')
      return
    }

    setIsSaving(true)
    setMessage('')

    try {
      await saveApiKey(selectedProvider, currentApiKey.trim())
      await setAutoCopyEnabled(autoCopyEnabled)
      await setAutoCopyTone(autoCopyTone)
      setMessage('Settings saved successfully.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error occurred while saving.')
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
    <div className="max-w-2xl mx-auto p-10 space-y-12 bg-background/50 min-h-screen">
      <div className="border-b pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-primary">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
          Configure your AI providers and application preferences to get the most out of your polite assistant.
        </p>
      </div>

      <Card className="shadow-sm border-primary/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-muted/30 border-b border-primary/5">
          <CardTitle className="text-lg font-bold">AI Provider settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Select AI Provider</label>
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
            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 inline-block">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                Active Model: {currentProvider.model}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-primary/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-muted/30 border-b border-primary/5">
          <CardTitle className="text-lg font-bold">{currentProvider.name} API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">API Key</label>
            <Input
              type="password"
              value={currentApiKey}
              onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
              placeholder={`Enter your ${currentProvider.name} API key`}
              className="font-mono text-sm bg-muted/20 border-primary/10"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={validationState === 'testing' || !currentApiKey.trim()}
              className="flex-1 font-semibold"
            >
              {validationState === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || !currentApiKey.trim()}
              className="flex-1 font-bold shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>

          {message && (
            <Alert variant={validationState === 'error' ? 'destructive' : 'default'} className="rounded-xl border-dashed">
              <div className="flex items-center gap-2">
                {validationState === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {validationState === 'error' && <XCircle className="w-4 h-4" />}
                <AlertDescription className="text-xs font-medium">{message}</AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-primary/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-muted/30 border-b border-primary/5">
          <CardTitle className="text-lg font-bold">Automation preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Checkbox
              id="auto-copy"
              checked={autoCopyEnabled}
              onCheckedChange={handleAutoCopyToggle}
              className="mt-1"
            />
            <div className="space-y-1.5">
              <label
                htmlFor="auto-copy"
                className="text-sm font-bold leading-none cursor-pointer text-foreground"
              >
                Auto-copy results to clipboard
              </label>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Automatically copies the result of your preferred tone to the clipboard upon conversion.
              </p>
            </div>
          </div>

          {autoCopyEnabled && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Preferred language style</label>
              <Select
                value={autoCopyTone}
                onValueChange={handleAutoCopyToneChange}
              >
                <SelectItem value="formal">Business Email</SelectItem>
                <SelectItem value="general">Slack/Teams Message</SelectItem>
                <SelectItem value="friendly">Casual Chat</SelectItem>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-primary/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-muted/30 border-b border-primary/5">
          <CardTitle className="text-lg font-bold">Setup instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {selectedProvider === 'gemini' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                How to get Google Gemini API Key
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground ml-3 border-l-2 border-muted pl-4">
                <li className="relative">
                  <span className="font-medium text-foreground">1. Visit AI Studio:</span> Access <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Google AI Studio</a>.
                </li>
                <li>
                  <span className="font-medium text-foreground">2. Sign in:</span> Log in with your Google account.
                </li>
                <li>
                  <span className="font-medium text-foreground">3. Generate Key:</span> Click "Get API Key" button.
                </li>
                <li>
                  <span className="font-medium text-foreground">4. Create:</span> Select "Create API Key in new project".
                </li>
                <li>
                  <span className="font-medium text-foreground">5. Copy & Paste:</span> Copy the key and paste it into the field above.
                </li>
              </ol>
            </div>
          )}

          {selectedProvider === 'chatgpt' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                How to get OpenAI API Key
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground ml-3 border-l-2 border-muted pl-4">
                <li>
                  <span className="font-medium text-foreground">1. Visit Platform:</span> Access <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">OpenAI Platform</a>.
                </li>
                <li>
                  <span className="font-medium text-foreground">2. Sign in:</span> Log in with your OpenAI account.
                </li>
                <li>
                  <span className="font-medium text-foreground">3. Create Secret:</span> Click "Create new secret key".
                </li>
                <li>
                  <span className="font-medium text-foreground">4. Name & Save:</span> Name your key and securely copy it.
                </li>
              </ol>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Important:</strong> OpenAI API is a paid service. Ensure you have valid billing credits on your account.
                </p>
              </div>
            </div>
          )}

          {selectedProvider === 'claude' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                How to get Anthropic Claude API Key
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground ml-3 border-l-2 border-muted pl-4">
                <li>
                  <span className="font-medium text-foreground">1. Visit Console:</span> Access <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Anthropic Console</a>.
                </li>
                <li>
                  <span className="font-medium text-foreground">2. Sign in:</span> Log in with your Anthropic account.
                </li>
                <li>
                  <span className="font-medium text-foreground">3. Navigate:</span> Select "API Keys" from the sidebar.
                </li>
                <li>
                  <span className="font-medium text-foreground">4. Create:</span> Click "Create Key" and copy the value.
                </li>
              </ol>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Important:</strong> Claude API is a paid service. Usage fees apply based on your plan.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 p-5 bg-muted/40 rounded-xl border border-primary/5">
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              <strong className="text-foreground">Privacy Note:</strong> Your API keys are encrypted and stored locally in your browser. They are never sent to any external servers other than the AI provider you've selected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings