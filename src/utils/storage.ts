import { AppStorage } from '@/types'

// 기본 설정값
const DEFAULT_STORAGE: AppStorage = {
  userApiKey: '',
  dailyUsage: {
    date: new Date().toISOString().split('T')[0],
    count: 0
  },
  settings: {
    preferredModel: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxOutputTokens: 1024
  }
}

/**
 * Chrome Storage에서 데이터를 읽어옵니다
 */
export async function getStorageData(): Promise<AppStorage> {
  try {
    const result = await chrome.storage.local.get(null)
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
 * API 키를 저장합니다 (암호화 적용)
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  const { encryptData } = await import('./crypto')
  const encryptedKey = await encryptData(apiKey)
  await setStorageData({ userApiKey: encryptedKey })
}

/**
 * API 키를 불러옵니다 (복호화 적용)
 */
export async function getApiKey(): Promise<string> {
  const data = await getStorageData()
  if (!data.userApiKey) return ''
  
  const { decryptData } = await import('./crypto')
  try {
    return await decryptData(data.userApiKey)
  } catch {
    return ''
  }
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
    return 5 // 새로운 날이면 5회 모두 사용 가능
  }
  
  return Math.max(0, 5 - data.dailyUsage.count)
}
