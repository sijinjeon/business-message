import { AppStorage, AIProvider, TargetLanguage, ToneType } from '@/types'
import { encryptData, decryptData } from './crypto'
import { AI_MODELS } from '@/services/ai/models'

// 기본 설정값 (v2.3 - 2026 기준)
const DEFAULT_STORAGE: AppStorage = {
  apiKeys: {
    gemini: '',
    chatgpt: '',
    claude: ''
  },
  dailyUsage: {
    date: new Date().toISOString().split('T')[0],
    count: 0
  },
  usageLogs: [],
  settings: {
    selectedProvider: 'gemini',
    providerModels: {
      gemini: 'gemini-2.5-flash',
      chatgpt: 'gpt-5.2',
      claude: 'claude-sonnet-4-5-20250929'
    },
    temperature: 0.7,
    maxOutputTokens: 1024,
    autoCopyEnabled: true,
    autoCopyTone: 'formal',
    instantToneStyle: 'formal',
    translation: {
      defaultTargetLanguage: 'ko',
      preserveLineBreaks: true,
      showNotification: true
    }
  },
  lastUsedTab: 'tone'
}

/**
 * Chrome Storage에서 데이터를 읽어옵니다
 */
export async function getStorageData(): Promise<AppStorage> {
  try {
    const result = await chrome.storage.local.get(null)
    
    // 기본값 병합
    const mergedData = { ...DEFAULT_STORAGE, ...result }
    
    // usageLogs 보장
    if (!mergedData.usageLogs) mergedData.usageLogs = []
    
    // settings 내부 객체들도 개별적으로 병합 (깊은 병합 필요)
    mergedData.settings = { ...DEFAULT_STORAGE.settings, ...result.settings }
    mergedData.settings.translation = { 
      ...DEFAULT_STORAGE.settings.translation, 
      ...result.settings?.translation 
    }
    mergedData.settings.providerModels = {
      ...DEFAULT_STORAGE.settings.providerModels,
      ...result.settings?.providerModels
    }

    // 모델 ID 최신화 마이그레이션 (2026 기준)
    if (mergedData.settings.providerModels.claude === 'claude-4-5-sonnet') {
      mergedData.settings.providerModels.claude = 'claude-sonnet-4-5-20250929';
    }
    if (mergedData.settings.providerModels.claude === 'claude-4-5-haiku') {
      mergedData.settings.providerModels.claude = 'claude-haiku-4-5-20251001';
    }
    if (mergedData.settings.providerModels.claude === 'claude-3-5-sonnet-latest') {
      mergedData.settings.providerModels.claude = 'claude-3-5-sonnet-20241022';
    }

    if (mergedData.settings.providerModels.gemini === 'gemini-1.5-flash') {
      mergedData.settings.providerModels.gemini = 'gemini-2.5-flash';
    }
    if (mergedData.settings.providerModels.chatgpt === 'gpt-4o-mini') {
      mergedData.settings.providerModels.chatgpt = 'gpt-5.2';
    }

    return mergedData
  } catch (error) {
    console.error('Storage read error:', error)
    return DEFAULT_STORAGE
  }
}

/**
 * Chrome Storage에 데이터를 저장합니다
 */
export async function setStorageData(data: Partial<AppStorage>): Promise<void> {
  try {
    await chrome.storage.local.set(data)
  } catch (error) {
    console.error('Storage write error:', error)
    throw new Error('데이터 저장에 실패했습니다.')
  }
}

/**
 * 특정 제공업체의 API 키를 저장합니다 (암호화 적용)
 */
export async function saveApiKey(provider: AIProvider, apiKey: string): Promise<void> {
  const encryptedKey = await encryptData(apiKey)
  const data = await getStorageData()
  
  await setStorageData({ 
    apiKeys: {
      ...data.apiKeys,
      [provider]: encryptedKey
    }
  })
}

/**
 * 특정 제공업체의 API 키를 불러옵니다 (복호화 적용)
 */
export async function getApiKey(provider: AIProvider): Promise<string> {
  const data = await getStorageData()
  if (!data.apiKeys[provider]) return ''
  
  try {
    return await decryptData(data.apiKeys[provider])
  } catch {
    return ''
  }
}

/**
 * 현재 선택된 제공업체의 API 키를 불러옵니다
 */
export async function getCurrentApiKey(): Promise<string> {
  const data = await getStorageData()
  return getApiKey(data.settings.selectedProvider)
}

/**
 * 선택된 AI 제공업체 관리
 */
export async function getSelectedProvider(): Promise<AIProvider> {
  const data = await getStorageData()
  return data.settings.selectedProvider
}

export async function setSelectedProvider(provider: AIProvider): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: { ...data.settings, selectedProvider: provider }
  })
}

/**
 * 제공자별 모델 관리
 */
export async function setProviderModel(provider: AIProvider, model: string): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      providerModels: { ...data.settings.providerModels, [provider]: model }
    }
  })
}

/**
 * 상세 사용량 로그 기록
 */
export async function logUsage(payload: {
  provider: AIProvider;
  model: string;
  task: 'tone-conversion' | 'translation';
  inputTokens?: number;
  outputTokens?: number;
}): Promise<void> {
  const data = await getStorageData()
  
  // 가격 정보 가져오기 (1M 토큰당 가격)
  const models = AI_MODELS[payload.provider] || []
  const modelInfo = models.find(m => m.id === payload.model)
  const pricePer1M = modelInfo?.pricePer1M || 0
  
  // 토큰 계산 (입력 + 출력) - 여기서는 간단히 추정치 사용
  const totalTokens = (payload.inputTokens || 0) + (payload.outputTokens || 0)
  const cost = (totalTokens / 1000000) * pricePer1M

  const newLog: any = {
    timestamp: Date.now(),
    ...payload,
    cost
  }

  // 로그는 최근 1000개만 유지 (스토리지 용량 제한 고려)
  const updatedLogs = [newLog, ...(data.usageLogs || [])].slice(0, 1000)
  
  await setStorageData({
    usageLogs: updatedLogs
  })
  
  // 일일 카운트도 업데이트
  await updateDailyUsage()
}

/**
 * 일일 사용량 관리
 */
export async function updateDailyUsage(): Promise<number> {
  const data = await getStorageData()
  const today = new Date().toISOString().split('T')[0]
  
  let newCount = 1
  if (data.dailyUsage.date === today) {
    newCount = data.dailyUsage.count + 1
  }
  
  await setStorageData({
    dailyUsage: { date: today, count: newCount }
  })
  
  return newCount
}

/**
 * 자동화 및 번역 설정 관리
 */
export async function getAutoCopyEnabled(): Promise<boolean> {
  const data = await getStorageData()
  return data.settings.autoCopyEnabled
}

export async function setAutoCopyEnabled(enabled: boolean): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: { ...data.settings, autoCopyEnabled: enabled }
  })
}

export async function getAutoCopyTone(): Promise<'formal' | 'general' | 'friendly'> {
  const data = await getStorageData()
  return data.settings.autoCopyTone
}

export async function setAutoCopyTone(tone: 'formal' | 'general' | 'friendly'): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: { ...data.settings, autoCopyTone: tone }
  })
}

/**
 * 탭 상태 관리
 */
export async function setLastUsedTab(tab: 'tone' | 'translation'): Promise<void> {
  await setStorageData({ lastUsedTab: tab })
}

/**
 * 번역 타겟 언어 관리
 */
export async function setTargetLanguage(lang: TargetLanguage): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      translation: { ...data.settings.translation, defaultTargetLanguage: lang }
    }
  })
}

/**
 * 즉시 변환 톤 스타일 설정
 */
export async function setInstantToneStyle(style: ToneType): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: { ...data.settings, instantToneStyle: style }
  })
}