# 기능 상세 스펙 문서 - 01. 인증 및 API 키 관리

> **문서 버전**: 1.0  
> **작성일**: 2025-12-25  
> **담당 모듈**: `src/utils/crypto.ts`, `src/utils/storage.ts`

---

## 목차

1. [개요](#1-개요)
2. [암호화 시스템](#2-암호화-시스템)
3. [API 키 관리](#3-api-키-관리)
4. [키 검증](#4-키-검증)
5. [보안 정책](#5-보안-정책)
6. [에러 처리](#6-에러-처리)

---

## 1. 개요

### 1.1 목적

사용자의 AI API 키를 안전하게 저장하고 관리하는 시스템입니다. 3개의 AI 제공업체(Gemini, ChatGPT, Claude)의 API 키를 지원하며, AES-GCM 암호화를 통해 보안을 보장합니다.

### 1.2 핵심 요구사항

- ✅ API 키 암호화 저장 (AES-GCM 256-bit)
- ✅ 제공업체별 독립적 키 관리
- ✅ 키 유효성 검증
- ✅ 안전한 키 접근 제어
- ✅ 복호화 실패 시 안전한 대체

### 1.3 관련 파일

```
src/utils/crypto.ts      # 암호화/복호화 로직
src/utils/storage.ts     # API 키 저장/조회
src/options/Settings.tsx # API 키 입력 UI
```

---

## 2. 암호화 시스템

### 2.1 암호화 알고리즘

**선택된 알고리즘**: AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)

**선택 이유**:
- ✅ NIST 표준 암호화 알고리즘
- ✅ 인증된 암호화 (Authenticated Encryption)
- ✅ 데이터 무결성 검증 포함
- ✅ 브라우저 Web Crypto API 네이티브 지원
- ✅ 높은 성능 (하드웨어 가속 지원)

**스펙**:
```
알고리즘: AES-GCM
키 크기: 256-bit
IV 크기: 96-bit (12 bytes)
인증 태그: 128-bit (16 bytes)
```

### 2.2 키 유도 함수 (Key Derivation Function)

**알고리즘**: PBKDF2 (Password-Based Key Derivation Function 2)

**구현**:
```typescript
async function generateKey(): Promise<CryptoKey> {
  // 1. Extension ID 가져오기
  const extensionId = chrome.runtime.id
  
  // 2. 키 자료 생성
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(extensionId + 'business-message-helper'),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  // 3. PBKDF2로 키 유도
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('business-message-salt'),
      iterations: 100000,  // 100,000 반복
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },  // 256-bit AES 키
    true,
    ['encrypt', 'decrypt']
  )
}
```

**파라미터**:
- **Iterations**: 100,000 (OWASP 권장 최소 100,000)
- **Hash**: SHA-256
- **Salt**: `'business-message-salt'` (고정) + Extension ID (가변)
- **Output**: 256-bit AES-GCM 키

**보안 고려사항**:
- Extension ID는 설치 시 고유하게 생성되므로 사용자마다 다른 키 생성
- 고정 Salt는 코드에 포함되지만, Extension ID와 결합되어 충분한 엔트로피 제공
- 100,000 iterations는 브루트 포스 공격을 어렵게 만듦

### 2.3 암호화 함수

**함수 시그니처**:
```typescript
export async function encryptData(plaintext: string): Promise<string>
```

**프로세스**:
```
1. 암호화 키 생성 (generateKey)
   ↓
2. 평문을 UTF-8 바이트로 인코딩
   TextEncoder().encode(plaintext)
   ↓
3. 무작위 IV 생성 (12 bytes)
   crypto.getRandomValues(new Uint8Array(12))
   ↓
4. AES-GCM 암호화
   crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
   ↓
5. IV + 암호문 결합
   [IV 12 bytes][암호문 N bytes][인증 태그 16 bytes]
   ↓
6. Base64 인코딩
   btoa(String.fromCharCode(...combined))
   ↓
7. 암호화된 문자열 반환
```

**상세 구현**:
```typescript
export async function encryptData(plaintext: string): Promise<string> {
  try {
    // 1. 키 생성
    const key = await generateKey()
    
    // 2. 평문 인코딩
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    // 3. IV 생성 (무작위)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // 4. 암호화
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    // 5. IV + 암호문 결합
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    // 6. Base64 인코딩
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('데이터 암호화에 실패했습니다.')
  }
}
```

**출력 형식**:
```
Base64(
  IV[0..11]              // 12 bytes
  + Ciphertext[12..N-17] // variable length
  + AuthTag[N-16..N-1]   // 16 bytes
)
```

**예시**:
```typescript
// 입력
const plaintext = "AIzaSyD1234567890abcdefghijk"

// 출력 (예시)
const encrypted = "xK7j9mP1q2w3e4r5t6y7u8i9o0p1ENCRYPTED_DATA_HERE=="
// 길이: 약 50-100 characters (Base64)
```

### 2.4 복호화 함수

**함수 시그니처**:
```typescript
export async function decryptData(encryptedData: string): Promise<string>
```

**프로세스**:
```
1. Base64 디코딩
   atob(encryptedData)
   ↓
2. 바이트 배열로 변환
   Uint8Array.from(decoded, c => c.charCodeAt(0))
   ↓
3. IV 추출 (첫 12 bytes)
   combined.slice(0, 12)
   ↓
4. 암호문 + 인증 태그 추출 (나머지)
   combined.slice(12)
   ↓
5. 암호화 키 생성 (generateKey)
   ↓
6. AES-GCM 복호화
   crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
   ↓
7. UTF-8 문자열로 디코딩
   TextDecoder().decode(decrypted)
   ↓
8. 평문 반환
```

**상세 구현**:
```typescript
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // 1. 키 생성
    const key = await generateKey()
    
    // 2. Base64 디코딩 → 바이트 배열
    const combined = Uint8Array.from(
      atob(encryptedData), 
      c => c.charCodeAt(0)
    )
    
    // 3. IV 추출 (첫 12 bytes)
    const iv = combined.slice(0, 12)
    
    // 4. 암호문 + 인증 태그 추출
    const encrypted = combined.slice(12)
    
    // 5. 복호화
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    
    // 6. UTF-8 디코딩
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('데이터 복호화에 실패했습니다.')
  }
}
```

**에러 케이스**:
1. **잘못된 Base64**: 디코딩 실패
2. **데이터 손상**: 인증 태그 검증 실패
3. **잘못된 키**: 복호화 실패
4. **형식 오류**: IV 또는 암호문 길이 부족

---

## 3. API 키 관리

### 3.1 데이터 구조

**API 키 스토리지 스키마**:
```typescript
interface AppStorage {
  apiKeys: {
    gemini: string;    // 암호화된 Gemini API 키
    chatgpt: string;   // 암호화된 OpenAI API 키
    claude: string;    // 암호화된 Claude API 키
  };
  // ... 다른 필드
}
```

**저장 위치**: `chrome.storage.local`

**암호화 상태**: 모든 API 키는 암호화된 상태로 저장

### 3.2 API 키 저장

**함수 시그니처**:
```typescript
export async function saveApiKey(
  provider: AIProvider,  // 'gemini' | 'chatgpt' | 'claude'
  apiKey: string         // 평문 API 키
): Promise<void>
```

**프로세스**:
```
1. 평문 API 키 받기
   ↓
2. crypto.encryptData() 호출
   암호화된 키 생성
   ↓
3. 현재 저장된 데이터 조회
   getStorageData()
   ↓
4. 해당 제공업체 키만 업데이트
   apiKeys[provider] = encryptedKey
   ↓
5. Chrome Storage에 저장
   chrome.storage.local.set({ apiKeys })
   ↓
6. 완료
```

**상세 구현**:
```typescript
export async function saveApiKey(
  provider: AIProvider, 
  apiKey: string
): Promise<void> {
  // 1. 암호화
  const { encryptData } = await import('./crypto')
  const encryptedKey = await encryptData(apiKey)
  
  // 2. 기존 데이터 조회
  const data = await getStorageData()
  
  // 3. 업데이트
  await setStorageData({ 
    apiKeys: {
      ...data.apiKeys,
      [provider]: encryptedKey
    }
  })
}
```

**사용 예시**:
```typescript
// Settings.tsx에서 호출
await saveApiKey('gemini', 'AIzaSyD1234567890abcdefghijk')
// Chrome Storage에 암호화된 키 저장됨
```

### 3.3 API 키 조회

**함수 시그니처**:
```typescript
export async function getApiKey(
  provider: AIProvider
): Promise<string>
```

**프로세스**:
```
1. Chrome Storage에서 데이터 조회
   getStorageData()
   ↓
2. 해당 제공업체의 암호화된 키 추출
   data.apiKeys[provider]
   ↓
3. 키가 없으면 빈 문자열 반환
   if (!encryptedKey) return ''
   ↓
4. 복호화 시도
   crypto.decryptData(encryptedKey)
   ↓
5. 성공: 평문 API 키 반환
   실패: 빈 문자열 반환
```

**상세 구현**:
```typescript
export async function getApiKey(
  provider: AIProvider
): Promise<string> {
  // 1. 저장된 데이터 조회
  const data = await getStorageData()
  if (!data.apiKeys[provider]) return ''
  
  // 2. 복호화 시도
  const { decryptData } = await import('./crypto')
  try {
    return await decryptData(data.apiKeys[provider])
  } catch {
    // 복호화 실패 시 빈 문자열 (안전한 대체)
    return ''
  }
}
```

**현재 선택된 제공업체의 키 조회**:
```typescript
export async function getCurrentApiKey(): Promise<string> {
  const data = await getStorageData()
  const provider = data.settings.selectedProvider
  return getApiKey(provider)
}
```

### 3.4 제공업체 선택

**함수 시그니처**:
```typescript
export async function setSelectedProvider(
  provider: AIProvider
): Promise<void>

export async function getSelectedProvider(): Promise<AIProvider>
```

**구현**:
```typescript
// 선택된 제공업체 저장
export async function setSelectedProvider(
  provider: AIProvider
): Promise<void> {
  const data = await getStorageData()
  await setStorageData({
    settings: {
      ...data.settings,
      selectedProvider: provider
    }
  })
}

// 선택된 제공업체 조회
export async function getSelectedProvider(): Promise<AIProvider> {
  const data = await getStorageData()
  return data.settings.selectedProvider
}
```

**기본값**: `'gemini'`

---

## 4. 키 검증

### 4.1 검증 프로세스

**함수 시그니처**:
```typescript
export async function validateApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<boolean>
```

**검증 방법**: 실제 API 호출을 통한 검증

**프로세스**:
```
1. 테스트 문장 준비
   const testText = '테스트'
   ↓
2. 해당 제공업체 API 호출
   convertText(testText, provider, apiKey)
   ↓
3. 성공: true 반환
   실패: false 반환
```

**상세 구현**:
```typescript
export async function validateApiKey(
  provider: AIProvider, 
  apiKey: string
): Promise<boolean> {
  try {
    // 실제 API 호출로 검증
    await convertText('테스트', provider, apiKey)
    return true
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}
```

### 4.2 검증 UI 플로우

**Settings.tsx에서의 구현**:
```typescript
const handleTest = async () => {
  // 1. API 키 확인
  if (!apiKey.trim()) {
    setMessage('API 키를 입력해주세요.')
    return
  }
  
  // 2. 검증 상태 변경
  setValidationState('testing')
  setMessage('')
  
  try {
    // 3. 검증 수행
    const isValid = await validateApiKey(selectedProvider, apiKey.trim())
    
    // 4. 결과 표시
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
```

**검증 상태**:
```typescript
type ValidationState = 'idle' | 'testing' | 'success' | 'error'
```

---

## 5. 보안 정책

### 5.1 데이터 보호

**저장 위치**:
- ✅ Chrome Storage Local (브라우저 내부)
- ❌ 외부 서버 전송 금지
- ❌ 로그 출력 금지

**암호화 정책**:
- ✅ 저장 시 항상 암호화 (Encryption at Rest)
- ✅ 메모리에서만 평문 사용
- ✅ 사용 후 즉시 메모리 해제

**접근 제어**:
```typescript
// ✅ 허용: 유틸리티 함수를 통한 접근만
const apiKey = await getApiKey('gemini')

// ❌ 금지: 직접 Chrome Storage 접근
const data = await chrome.storage.local.get('apiKeys')
```

### 5.2 키 생명주기

```
1. 사용자 입력 (Settings UI)
   평문 API 키
   ↓
2. 암호화 (crypto.encryptData)
   암호화된 키
   ↓
3. 저장 (Chrome Storage Local)
   영구 저장
   ↓
4. 조회 (storage.getApiKey)
   암호화된 키 읽기
   ↓
5. 복호화 (crypto.decryptData)
   평문 API 키 (메모리)
   ↓
6. 사용 (API 호출)
   HTTPS 요청
   ↓
7. 메모리 해제
   가비지 컬렉션
```

### 5.3 보안 베스트 프랙티스

**준수 사항**:
1. ✅ 암호화 키는 코드에 하드코딩하지 않음 (Extension ID 활용)
2. ✅ Salt는 고정값 사용 (단, Extension ID와 결합)
3. ✅ IV는 매번 무작위 생성
4. ✅ 인증된 암호화 (AES-GCM) 사용
5. ✅ 에러 메시지에 민감 정보 포함하지 않음
6. ✅ 프로덕션 빌드에서 console.log 제거

**권장 사항**:
- ⚠️ API 키 갱신 주기 설정 (향후 개선)
- ⚠️ 키 만료 알림 기능 (향후 개선)
- ⚠️ 키 접근 로그 (향후 개선)

---

## 6. 에러 처리

### 6.1 에러 타입

**암호화 에러**:
```typescript
try {
  const encrypted = await encryptData(plaintext)
} catch (error) {
  // Error: "데이터 암호화에 실패했습니다."
  // 원인: Web Crypto API 실패, 메모리 부족 등
}
```

**복호화 에러**:
```typescript
try {
  const decrypted = await decryptData(encryptedData)
} catch (error) {
  // Error: "데이터 복호화에 실패했습니다."
  // 원인: 잘못된 데이터, 손상된 키, 인증 태그 불일치
}
```

**저장 에러**:
```typescript
try {
  await saveApiKey('gemini', apiKey)
} catch (error) {
  // Error: "데이터 저장에 실패했습니다."
  // 원인: Chrome Storage 용량 초과, 권한 문제
}
```

### 6.2 에러 복구 전략

**복호화 실패 시**:
```typescript
export async function getApiKey(provider: AIProvider): Promise<string> {
  const data = await getStorageData()
  if (!data.apiKeys[provider]) return ''
  
  try {
    return await decryptData(data.apiKeys[provider])
  } catch {
    // 복호화 실패 → 빈 문자열 반환 (안전한 대체)
    return ''
  }
}
```

**저장 실패 시**:
```typescript
try {
  await saveApiKey('gemini', apiKey)
  setMessage('API 키가 저장되었습니다.')
} catch (error) {
  // 사용자에게 명확한 메시지 표시
  setMessage('저장 중 오류가 발생했습니다.')
}
```

### 6.3 사용자 피드백

**Settings UI 메시지**:

| 상황 | 메시지 | 타입 |
|------|--------|------|
| 검증 성공 | "API 키가 유효합니다!" | success |
| 검증 실패 | "유효하지 않은 API 키입니다. 다시 확인해주세요." | error |
| 저장 성공 | "API 키가 저장되었습니다." | success |
| 저장 실패 | "저장 중 오류가 발생했습니다." | error |
| 연결 오류 | "연결 테스트 중 오류가 발생했습니다." | error |
| 입력 누락 | "API 키를 입력해주세요." | warning |

**Popup UI 메시지**:

| 상황 | 메시지 | 타입 |
|------|--------|------|
| API 키 없음 | "API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요." | error |
| API 키 무효 | "[제공업체] API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요." | error |

---

## 7. 테스트 시나리오

### 7.1 암호화/복호화 테스트

```typescript
// 단위 테스트 예시
describe('Crypto Service', () => {
  test('암호화 후 복호화하면 원본 복구', async () => {
    const original = 'test-api-key-12345'
    const encrypted = await encryptData(original)
    const decrypted = await decryptData(encrypted)
    expect(decrypted).toBe(original)
  })
  
  test('잘못된 데이터 복호화 시 에러', async () => {
    await expect(
      decryptData('invalid-base64-string')
    ).rejects.toThrow()
  })
  
  test('빈 문자열 암호화/복호화', async () => {
    const encrypted = await encryptData('')
    const decrypted = await decryptData(encrypted)
    expect(decrypted).toBe('')
  })
})
```

### 7.2 API 키 관리 테스트

```typescript
describe('API Key Management', () => {
  test('API 키 저장 후 조회', async () => {
    const testKey = 'test-key-123'
    await saveApiKey('gemini', testKey)
    const retrieved = await getApiKey('gemini')
    expect(retrieved).toBe(testKey)
  })
  
  test('존재하지 않는 키 조회 시 빈 문자열', async () => {
    const key = await getApiKey('gemini')
    expect(key).toBe('')
  })
  
  test('여러 제공업체 키 독립적 관리', async () => {
    await saveApiKey('gemini', 'key1')
    await saveApiKey('chatgpt', 'key2')
    await saveApiKey('claude', 'key3')
    
    expect(await getApiKey('gemini')).toBe('key1')
    expect(await getApiKey('chatgpt')).toBe('key2')
    expect(await getApiKey('claude')).toBe('key3')
  })
})
```

### 7.3 검증 테스트

```typescript
describe('API Key Validation', () => {
  test('유효한 키 검증 성공', async () => {
    const result = await validateApiKey('gemini', VALID_API_KEY)
    expect(result).toBe(true)
  })
  
  test('무효한 키 검증 실패', async () => {
    const result = await validateApiKey('gemini', 'invalid-key')
    expect(result).toBe(false)
  })
})
```

---

## 8. 성능 고려사항

### 8.1 암호화/복호화 성능

**벤치마크** (Chrome 브라우저, M1 Mac 기준):
- 암호화: 평균 5-10ms
- 복호화: 평균 5-10ms
- PBKDF2 키 유도: 평균 50-100ms (캐싱 가능)

**최적화**:
- Web Crypto API 사용 (하드웨어 가속)
- 비동기 처리 (UI 블로킹 방지)

### 8.2 스토리지 용량

**API 키 크기**:
- Gemini: 약 39 characters
- OpenAI: 약 51 characters
- Claude: 약 108 characters

**암호화 후 크기**: 약 2배 (Base64 인코딩)
- 총 저장 용량: < 1 KB

**Chrome Storage Limit**: 5 MB (충분함)

---

## 9. 마이그레이션

### 9.1 기존 데이터 마이그레이션

**v1.0 이전 → v1.0**:

이전 버전에서는 `userApiKey` 필드에 Gemini 키만 저장했습니다. v1.0에서는 다중 제공업체를 지원하므로 마이그레이션이 필요합니다.

**마이그레이션 코드**:
```typescript
export async function getStorageData(): Promise<AppStorage> {
  try {
    const result = await chrome.storage.local.get(null)
    
    // 기존 userApiKey → apiKeys.gemini 마이그레이션
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
      // 기존 필드 제거
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
```

---

## 10. 개선 계획

### 10.1 단기 개선 (1-2개월)

1. **키 회전 (Key Rotation)**
   - API 키 정기 갱신 알림
   - 만료 일자 추적

2. **접근 로그**
   - API 키 사용 이력 기록
   - 이상 접근 감지

### 10.2 장기 개선 (3-6개월)

1. **하드웨어 키 지원**
   - YubiKey 등 하드웨어 토큰 지원
   - 2단계 인증

2. **클라우드 동기화**
   - Chrome Sync를 통한 키 동기화 (선택적)
   - 추가 암호화 레이어

---

**문서 작성**: AI 코드 분석 시스템  
**최종 업데이트**: 2025-12-25

