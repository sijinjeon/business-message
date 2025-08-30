/**
 * 확장 프로그램 ID 기반 암호화 키 생성
 */
async function generateKey(): Promise<CryptoKey> {
  const extensionId = chrome.runtime.id
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(extensionId + 'business-message-helper'),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('business-message-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * 데이터를 암호화합니다
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    const key = await generateKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    // IV와 암호화된 데이터를 결합하여 Base64로 인코딩
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('데이터 암호화에 실패했습니다.')
  }
}

/**
 * 데이터를 복호화합니다
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await generateKey()
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('데이터 복호화에 실패했습니다.')
  }
}
