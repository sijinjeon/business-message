import { AppStorage, AIProvider } from '@/types'

// 기본 설정값
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
  settings: {
    selectedProvider: 'gemini',
    preferredModel: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxOutputTokens: 1024,
    autoCopyEnabled: true,
    autoCopyTone: 'formal'
  }
}

/**
 * Chrome Storage에서 데이터를 읽어옵니다
 */
export async function getStorageData(): Promise<AppStorage> {
  try {
    const result = await chrome.storage.local.get(null)
    
    // 기존 데이터 마이그레이션 (userApiKey -> apiKeys.gemini)
    if (result.userApiKey && !result.apiKeys?.gemini) {
      const migratedData = {
        ...DEFAULT_STORAGE,
        ...result,
        apiKeys: {
          gemini: result.userApiKey,
          chatgpt: '',
          claude: ''
        }
      }
      // 기존 userApiKey 제거
      delete (migratedData as any).userApiKey
      await chrome.storage.local.set(migratedData)
      return migratedData
    }
    
    return { ...DEFAULT_STORAGE, ...result }
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
  const { encryptData } = await import('./crypto')
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
  
  const { decryptData } = await import('./crypto')
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
 * 선택된 AI 제공업체를 가져옵니다
 */
export async function getSelectedProvider(): Promise<AIProvider> {
  const data = await getStorageData()
  return data.settings.selectedProvider
}

/**
 * 선택된 AI 제공업체를 저장합니다
 */
export async function setSelectedProvider(provider: AIProvider): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      selectedProvider: provider
    }
  })
}

/**
 * 일일 사용량을 업데이트합니다
 */
export async function updateDailyUsage(): Promise<number> {
  const data = await getStorageData()
  const today = new Date().toISOString().split('T')[0]
  
  let newCount = 1
  if (data.dailyUsage.date === today) {
    newCount = data.dailyUsage.count + 1
  }
  
  await setStorageData({
    dailyUsage: {
      date: today,
      count: newCount
    }
  })
  
  return newCount
}

/**
 * 남은 사용 횟수를 확인합니다
 */
export async function getRemainingUsage(): Promise<number> {
  const data = await getStorageData()
  const today = new Date().toISOString().split('T')[0]
  
  if (data.dailyUsage.date !== today) {
    return 50 // 새로운 날이면 50회 모두 사용 가능
  }
  
  return Math.max(0, 50 - data.dailyUsage.count)
}

/**
 * 자동 복사 설정을 가져옵니다
 */
export async function getAutoCopyEnabled(): Promise<boolean> {
  const data = await getStorageData()
  return data.settings.autoCopyEnabled
}

/**
 * 자동 복사 설정을 저장합니다
 */
export async function setAutoCopyEnabled(enabled: boolean): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      autoCopyEnabled: enabled
    }
  })
}

/**
 * 자동 복사 톤을 가져옵니다
 */
export async function getAutoCopyTone(): Promise<'formal' | 'general' | 'friendly'> {
  const data = await getStorageData()
  return data.settings.autoCopyTone
}

/**
 * 자동 복사 톤을 저장합니다
 */
export async function setAutoCopyTone(tone: 'formal' | 'general' | 'friendly'): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      autoCopyTone: tone
    }
  })
}
