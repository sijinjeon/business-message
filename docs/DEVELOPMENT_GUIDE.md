
# 개발 가이드: 정중한 문장 도우미 (business-message)

> **문서 버전:** 1.0  
> **기준 문서:** PRD v1.0, TRD v1.0, IA v1.0, CODE_GUIDELINE v1.0, DESIGN_GUIDE v1.0  
> **작성일:** 2025-08-30  
> **대상:** 프론트엔드 개발자 (React, TypeScript, Chrome Extension 경험 선호)

## 📋 목차

1. [개요 및 준비사항](#1-개요-및-준비사항)
2. [Phase 0: 개발 환경 설정](#phase-0-개발-환경-설정)
3. [Phase 1: 프로젝트 기초 구조 구축](#phase-1-프로젝트-기초-구조-구축)
4. [Phase 2: 핵심 기능 개발](#phase-2-핵심-기능-개발)
5. [Phase 3: UI 컴포넌트 개발](#phase-3-ui-컴포넌트-개발)
6. [Phase 4: 통합 및 테스트](#phase-4-통합-및-테스트)
7. [Phase 5: 배포 및 패키징](#phase-5-배포-및-패키징)
8. [트러블슈팅 및 FAQ](#트러블슈팅-및-faq)

---

## 1. 개요 및 준비사항

### 1.1. 프로젝트 개요
'정중한 문장 도우미'는 클립보드의 텍스트를 AI를 통해 세 가지 톤(격식, 일반, 친근)으로 변환하는 Chrome Extension입니다.

### 1.2. 필요한 사전 지식
- **필수:** React, TypeScript, Chrome Extension 기본 개념
- **권장:** Vite, shadcn/ui, Chrome Storage API

### 1.3. 개발 환경 요구사항
- **Node.js:** v20.x 이상
- **npm:** v10.x 이상  
- **Chrome:** 최신 버전 (Extension 테스트용)
- **에디터:** VS Code 권장 (ESLint, Prettier 확장 프로그램 설치)

### 1.4. 예상 개발 기간
- **전체:** 3-4주 (1인 개발자 기준)
- **Phase 0-1:** 2-3일
- **Phase 2:** 4-5일  
- **Phase 3:** 7-10일
- **Phase 4-5:** 3-4일

---

## Phase 0: 개발 환경 설정

**예상 소요시간:** 2-3시간

### ✅ Task 체크리스트

- [ ] **0.1** Node.js 및 npm 버전 확인
- [ ] **0.2** 프로젝트 디렉토리 생성
- [ ] **0.3** Git 저장소 초기화
- [ ] **0.4** package.json 설정 및 의존성 설치
- [ ] **0.5** Vite 설정 파일 작성
- [ ] **0.6** TypeScript 설정
- [ ] **0.7** ESLint 및 Prettier 설정
- [ ] **0.8** 개발 서버 실행 테스트

### 📝 상세 구현 가이드

#### 0.1 Node.js 버전 확인
```bash
node --version  # v20.0.0 이상 확인
npm --version   # v10.0.0 이상 확인
```

#### 0.2 프로젝트 디렉토리 생성
```bash
mkdir business-message
cd business-message
```

#### 0.3 Git 저장소 초기화
```bash
git init
echo "node_modules/\ndist/\n.env\n*.log" > .gitignore
```

#### 0.4 package.json 설정
> **참조:** TRD 9.3절

```bash
npm init -y
```

**package.json** 파일을 다음과 같이 수정:

```json
{
  "name": "business-message-helper",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.25",
    "@types/chrome": "^0.0.270",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.15.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "terser": "^5.36.0",
    "typescript": "^5.7.2",
    "vite": "^7.0.0"
  }
}
```

```bash
npm install
```

#### 0.5 Vite 설정 파일
> **참조:** TRD 9.1절

**vite.config.ts** 생성:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html'
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
})
```

#### 0.6 TypeScript 설정
> **참조:** TRD 9.2절

**tsconfig.json** 생성:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["chrome", "node"]
  },
  "include": [
    "src",
    "manifest.json"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

#### 0.7 ESLint 및 Prettier 설정
> **참조:** CODE_GUIDELINE 4.1절

**.eslintrc.json** 생성:
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh"],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}
```

**.prettierrc** 생성:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### 0.8 검증 단계
```bash
npm run type-check  # TypeScript 컴파일 확인
npm run lint        # ESLint 규칙 확인
```

---

## Phase 1: 프로젝트 기초 구조 구축

**예상 소요시간:** 3-4시간

### ✅ Task 체크리스트

- [ ] **1.1** 디렉토리 구조 생성
- [ ] **1.2** manifest.json 작성
- [ ] **1.3** HTML 파일들 생성
- [ ] **1.4** TypeScript 타입 정의
- [ ] **1.5** 전역 스타일 설정
- [ ] **1.6** 기본 컴포넌트 구조 생성

### 📝 상세 구현 가이드

#### 1.1 디렉토리 구조 생성
> **참조:** TRD 9.4절

```bash
mkdir -p src/{popup,options,utils,types,styles}
mkdir -p src/popup/components
mkdir -p public/images
```

**최종 구조:**
```
business-message/
├── src/
│   ├── popup/
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── TextInput.tsx
│   │       ├── ResultCard.tsx
│   │       └── ActionBar.tsx
│   ├── options/
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── Settings.tsx
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── api.ts
│   │   └── crypto.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── global.css
├── public/
│   └── images/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── manifest.json
├── vite.config.ts
├── tsconfig.json
└── package.json
```

#### 1.2 manifest.json 작성
> **참조:** TRD 3.2절

**manifest.json** 생성:

```json
{
  "manifest_version": 3,
  "name": "정중한 문장 도우미",
  "version": "1.0.0",
  "description": "클립보드에 복사된 문장을 AI를 통해 정중한 비즈니스 표현으로 변환합니다.",
  "permissions": [
    "storage",
    "clipboardRead",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://generativelanguage.googleapis.com/*"
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_title": "정중한 문장 도우미"
  },
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  "options_page": "src/options/index.html",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

#### 1.3 HTML 파일들 생성

**src/popup/index.html:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>정중한 문장 도우미</title>
  <style>
    body {
      width: 400px;
      height: 600px;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

**src/options/index.html:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>정중한 문장 도우미 - 설정</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

#### 1.4 TypeScript 타입 정의
> **참조:** TRD 5절, IA 6절

**src/types/index.ts:**
```typescript
// Chrome Storage 데이터 스키마
export interface AppStorage {
  userApiKey: string; // 암호화된 API 키
  dailyUsage: {
    date: string; // 'YYYY-MM-DD'
    count: number; // 사용 횟수
  };
  settings: {
    preferredModel: 'gemini-2.0-flash-exp';
    temperature: number; // 0.1 ~ 1.0
    maxOutputTokens: number; // 기본 1024
  };
}

// API 응답 타입
export interface GeminiApiResponse {
  formal: string;
  general: string;
  friendly: string;
}

// API 요청 타입
export interface GeminiApiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    candidateCount: number;
    topK: number;
    topP: number;
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

// 컴포넌트 Props 타입들
export interface ResultCardProps {
  tone: 'formal' | 'general' | 'friendly';
  label: string;
  text: string;
  onCopy: (text: string) => void;
  isDefaultSelected?: boolean;
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
}

export interface ActionBarProps {
  onRegenerate: () => void;
  remainingCount: number;
  isLoading: boolean;
}

// 상태 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  inputText: string;
  results: GeminiApiResponse | null;
  loadingState: LoadingState;
  errorMessage: string;
  remainingUsage: number;
}
```

#### 1.5 전역 스타일 설정
> **참조:** DESIGN_GUIDE 3절

**src/styles/global.css:**
```css
/* CSS Variables - shadcn/ui 호환 */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 47.4% 11.2%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 215.4 16.3% 46.9%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

/* 기본 스타일 */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 0;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 14px;
  line-height: 1.5;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 3px;
}
```

#### 1.6 기본 컴포넌트 구조 생성

**src/popup/index.tsx:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**src/popup/App.tsx:**
```typescript
import React from 'react'

function App() {
  return (
    <div className="w-full h-full p-4">
      <h1 className="text-lg font-semibold mb-4">정중한 문장 도우미</h1>
      <p className="text-sm text-muted-foreground">개발 중...</p>
    </div>
  )
}

export default App
```

**src/options/index.tsx:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './Settings'
import '../styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>,
)
```

**src/options/Settings.tsx:**
```typescript
import React from 'react'

function Settings() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">설정</h1>
      <p className="text-muted-foreground">설정 페이지 개발 중...</p>
    </div>
  )
}

export default Settings
```

### 🔍 검증 단계

```bash
npm run dev  # 개발 서버 실행
```

Chrome에서 `chrome://extensions/` 접속 후:
1. "개발자 모드" 활성화
2. "압축해제된 확장 프로그램을 로드합니다" 클릭
3. `dist` 폴더 선택
4. 확장 프로그램 아이콘 클릭하여 팝업 확인

---

## Phase 2: 핵심 기능 개발

**예상 소요시간:** 6-8시간

### ✅ Task 체크리스트

- [ ] **2.1** Chrome Storage 유틸리티 구현
- [ ] **2.2** 암호화 유틸리티 구현  
- [ ] **2.3** Google Gemini API 연동 모듈 구현
- [ ] **2.4** 클립보드 연동 함수 구현
- [ ] **2.5** 사용량 제한 로직 구현
- [ ] **2.6** 에러 핸들링 유틸리티 구현

### 📝 상세 구현 가이드

#### 2.1 Chrome Storage 유틸리티
> **참조:** CODE_GUIDELINE 7.1절, TRD 5절

**src/utils/storage.ts:**
```typescript
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
```

#### 2.2 암호화 유틸리티
> **참조:** CODE_GUIDELINE 7절, TRD 6.1절

**src/utils/crypto.ts:**
```typescript
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
```

#### 2.3 Google Gemini API 연동
> **참조:** TRD 4절

**src/utils/api.ts:**
```typescript
import { GeminiApiRequest, GeminiApiResponse } from '@/types'

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

/**
 * 시스템 프롬프트 생성
 */
function createSystemPrompt(userText: string): string {
  return `# Role
당신은 한국의 직장 문화와 커뮤니케이션에 매우 능숙한 AI 어시스턴트입니다.

# Instruction
주어진 '원본 텍스트'를 아래 '출력 형식'에 맞춰 세 가지 톤으로 변환해주세요. 각 톤은 한국의 업무 환경에 적합해야 하며, 자연스럽고 명확하게 작성해야 합니다.

# Tones
1. **격식 (Formal):** 상사, 외부 고객, 공식적인 문서에 사용하는 매우 정중하고 격식 있는 톤.
2. **일반 (General):** 일반적인 동료와의 협업, 팀 내 커뮤니케이션에 사용하는 정중하지만 부드러운 톤.
3. **친근 (Friendly):** 친한 동료와의 일상적인 대화에 사용하는 간결하고 친근한 톤.

# Output Format
반드시 아래와 같은 JSON 형식으로만 응답해야 합니다. 다른 설명은 절대 추가하지 마세요.
\`\`\`json
{
  "formal": "여기에 격식있는 톤의 변환 결과를 작성하세요.",
  "general": "여기에 일반적인 동료 톤의 변환 결과를 작성하세요.",
  "friendly": "여기에 친근한 톤의 변환 결과를 작성하세요."
}
\`\`\`

# Original Text
${userText}`
}

/**
 * API 요청 페이로드 생성
 */
function createApiPayload(userText: string): GeminiApiRequest {
  return {
    contents: [{
      parts: [{
        text: createSystemPrompt(userText)
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      candidateCount: 1,
      topK: 40,
      topP: 0.95
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  }
}

/**
 * API 응답에서 JSON 추출
 */
function extractJsonFromResponse(text: string): GeminiApiResponse {
  // JSON 블록 찾기
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('API 응답에서 JSON을 찾을 수 없습니다.')
  }
  
  try {
    const jsonText = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonText)
    
    if (!parsed.formal || !parsed.general || !parsed.friendly) {
      throw new Error('API 응답 형식이 올바르지 않습니다.')
    }
    
    return {
      formal: parsed.formal.trim(),
      general: parsed.general.trim(),
      friendly: parsed.friendly.trim()
    }
  } catch (error) {
    console.error('JSON parsing error:', error)
    throw new Error('API 응답을 파싱할 수 없습니다.')
  }
}

/**
 * 텍스트를 세 가지 톤으로 변환
 */
export async function convertText(userText: string, apiKey: string): Promise<GeminiApiResponse> {
  if (!userText.trim()) {
    throw new Error('변환할 텍스트를 입력해주세요.')
  }
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.')
  }
  
  const payload = createApiPayload(userText)
  
  try {
    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요.')
      } else if (response.status >= 500) {
        throw new Error('AI 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        throw new Error(`API 호출 실패 (${response.status})`)
      }
    }
    
    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('API 응답이 예상과 다릅니다.')
    }
    
    const responseText = data.candidates[0].content.parts[0].text
    return extractJsonFromResponse(responseText)
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('네트워크 연결을 확인해주세요.')
  }
}

/**
 * API 키 유효성 검증
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await convertText('테스트', apiKey)
    return true
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}
```

#### 2.4 클립보드 연동 함수
> **참조:** TRD 3.4절

**src/utils/clipboard.ts:**
```typescript
/**
 * 클립보드에서 텍스트를 읽어옵니다
 */
export async function readClipboard(): Promise<string> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('클립보드 접근이 지원되지 않습니다.')
    }
    
    const text = await navigator.clipboard.readText()
    return text.trim()
  } catch (error) {
    console.error('Clipboard read error:', error)
    return ''
  }
}

/**
 * 클립보드에 텍스트를 복사합니다
 */
export async function writeClipboard(text: string): Promise<void> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('클립보드 접근이 지원되지 않습니다.')
    }
    
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Clipboard write error:', error)
    throw new Error('클립보드 복사에 실패했습니다.')
  }
}
```

### 🔍 검증 단계

각 유틸리티 함수들이 정상 작동하는지 확인:

```typescript
// 개발자 도구 콘솔에서 테스트
import { getStorageData, setStorageData } from './utils/storage'

// 스토리지 테스트
getStorageData().then(console.log)
```

---

## Phase 3: UI 컴포넌트 개발

**예상 소요시간:** 8-12시간

### ✅ Task 체크리스트

- [ ] **3.1** shadcn/ui 설치 및 설정
- [ ] **3.2** 기본 UI 컴포넌트 설치
- [ ] **3.3** TextInput 컴포넌트 구현
- [ ] **3.4** ResultCard 컴포넌트 구현
- [ ] **3.5** ActionBar 컴포넌트 구현
- [ ] **3.6** 팝업 메인 화면 구현
- [ ] **3.7** 설정 화면 구현
- [ ] **3.8** 로딩 및 에러 상태 구현

### 📝 상세 구현 가이드

#### 3.1 shadcn/ui 설치 및 설정
> **참조:** DESIGN_GUIDE 6절

```bash
# shadcn/ui 초기화
npx shadcn@latest init
```

설정 옵션:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- Global CSS file: src/styles/global.css
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components: src/components
- Utils: src/lib/utils

**tailwind.config.js 수정:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### 3.2 기본 UI 컴포넌트 설치

```bash
# 필요한 컴포넌트들 설치
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add textarea
npx shadcn@latest add alert
npx shadcn@latest add skeleton
npx shadcn@latest add input
npx shadcn@latest add toast
```

#### 3.3 TextInput 컴포넌트 구현
> **참조:** IA 5.1절 P-2

**src/popup/components/TextInput.tsx:**
```typescript
import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { TextInputProps } from '@/types'

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  maxLength,
  placeholder
}) => {
  const characterCount = value.length
  const isOverLimit = characterCount > maxLength
  
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[120px] resize-none ${
          isOverLimit ? 'border-destructive focus:border-destructive' : ''
        }`}
        maxLength={maxLength + 50} // 약간의 여유 공간
      />
      <div className="flex justify-end">
        <span className={`text-xs ${
          isOverLimit ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {characterCount}/{maxLength}
        </span>
      </div>
      {isOverLimit && (
        <p className="text-xs text-destructive">
          텍스트가 너무 깁니다. {maxLength}자 이내로 입력해주세요.
        </p>
      )}
    </div>
  )
}

export default TextInput
```

#### 3.4 ResultCard 컴포넌트 구현
> **참조:** IA 5.1절 P-5, DESIGN_GUIDE 6.2절

**src/popup/components/ResultCard.tsx:**
```typescript
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { ResultCardProps } from '@/types'

const TONE_LABELS = {
  formal: '격식',
  general: '일반',
  friendly: '친근'
}

const ResultCard: React.FC<ResultCardProps> = ({
  tone,
  text,
  onCopy,
  isDefaultSelected = false
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const label = TONE_LABELS[tone]
  
  const handleCopy = async () => {
    try {
      await onCopy(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }
  
  return (
    <Card className={`relative ${
      isDefaultSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{label}</span>
          {isDefaultSelected && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
              기본 선택
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed mb-3 min-h-[60px]">
          {text}
        </p>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResultCard
```

#### 3.5 ActionBar 컴포넌트 구현
> **참조:** IA 5.1절 P-3

**src/popup/components/ActionBar.tsx:**
```typescript
import React from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw, Settings } from 'lucide-react'
import { ActionBarProps } from '@/types'

const ActionBar: React.FC<ActionBarProps> = ({
  onRegenerate,
  remainingCount,
  isLoading,
  onOpenSettings
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading || remainingCount <= 0}
          className="flex items-center gap-2"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          다시 생성
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {remainingCount > 0 ? (
          <>오늘 남은 횟수: <span className="font-medium">{remainingCount}/5</span></>
        ) : (
          <span className="text-destructive font-medium">오늘 사용량을 모두 사용하셨습니다</span>
        )}
      </div>
    </div>
  )
}

export default ActionBar
```

#### 3.6 팝업 메인 화면 구현
> **참조:** IA 5.1절, PRD 6.1절

**src/popup/App.tsx:**
```typescript
import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import TextInput from './components/TextInput'
import ResultCard from './components/ResultCard'
import ActionBar from './components/ActionBar'
import { AppState, LoadingState, GeminiApiResponse } from '@/types'
import { readClipboard, writeClipboard } from '@/utils/clipboard'
import { convertText } from '@/utils/api'
import { getApiKey, getRemainingUsage, updateDailyUsage } from '@/utils/storage'

const INITIAL_STATE: AppState = {
  inputText: '',
  results: null,
  loadingState: 'idle',
  errorMessage: '',
  remainingUsage: 5
}

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  
  // 초기화
  useEffect(() => {
    initializeApp()
  }, [])
  
  const initializeApp = async () => {
    try {
      // 클립보드에서 텍스트 읽기
      const clipboardText = await readClipboard()
      
      // 남은 사용량 확인
      const remaining = await getRemainingUsage()
      
      setState(prev => ({
        ...prev,
        inputText: clipboardText,
        remainingUsage: remaining
      }))
      
      // 클립보드에 텍스트가 있고 사용량이 남아있으면 자동 변환
      if (clipboardText && remaining > 0) {
        await handleConvert(clipboardText)
      }
    } catch (error) {
      console.error('Initialization error:', error)
    }
  }
  
  const handleConvert = async (text?: string) => {
    const textToConvert = text || state.inputText
    
    if (!textToConvert.trim()) {
      setState(prev => ({
        ...prev,
        errorMessage: '변환할 텍스트를 입력해주세요.'
      }))
      return
    }
    
    if (textToConvert.length > 500) {
      setState(prev => ({
        ...prev,
        errorMessage: '텍스트가 너무 깁니다. 500자 이내로 입력해주세요.'
      }))
      return
    }
    
    if (state.remainingUsage <= 0) {
      setState(prev => ({
        ...prev,
        errorMessage: '오늘의 무료 사용량을 모두 사용하셨습니다.'
      }))
      return
    }
    
    setState(prev => ({
      ...prev,
      loadingState: 'loading',
      errorMessage: '',
      results: null
    }))
    
    try {
      const apiKey = await getApiKey()
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
      }
      
      const results = await convertText(textToConvert, apiKey)
      
      // 사용량 업데이트
      const newCount = await updateDailyUsage()
      const newRemaining = Math.max(0, 5 - newCount)
      
      // 기본값(격식) 자동 복사
      await writeClipboard(results.formal)
      
      setState(prev => ({
        ...prev,
        loadingState: 'success',
        results,
        remainingUsage: newRemaining
      }))
      
    } catch (error) {
      console.error('Conversion error:', error)
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }))
    }
  }
  
  const handleCopy = async (text: string) => {
    await writeClipboard(text)
  }
  
  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage()
  }
  
  const handleInputChange = (value: string) => {
    setState(prev => ({
      ...prev,
      inputText: value,
      errorMessage: ''
    }))
  }
  
  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">정중한 문장 도우미</h1>
      </div>
      
      {/* 입력 영역 */}
      <TextInput
        value={state.inputText}
        onChange={handleInputChange}
        maxLength={500}
        placeholder="변환할 텍스트를 복사하거나, 직접 입력해주세요."
      />
      
      {/* 액션 바 */}
      <ActionBar
        onRegenerate={() => handleConvert()}
        remainingCount={state.remainingUsage}
        isLoading={state.loadingState === 'loading'}
        onOpenSettings={handleOpenSettings}
      />
      
      {/* 에러 메시지 */}
      {state.errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{state.errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* 결과 영역 */}
      <div className="space-y-3">
        {state.loadingState === 'loading' && (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        )}
        
        {state.results && (
          <>
            <ResultCard
              tone="formal"
              text={state.results.formal}
              onCopy={handleCopy}
              isDefaultSelected
            />
            <ResultCard
              tone="general"
              text={state.results.general}
              onCopy={handleCopy}
            />
            <ResultCard
              tone="friendly"
              text={state.results.friendly}
              onCopy={handleCopy}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App
```

#### 3.7 설정 화면 구현
> **참조:** IA 5.2절

**src/options/Settings.tsx:**
```typescript
import React, { useState, useEffect } from 'react'
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
```

### 🔍 검증 단계

1. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

2. **Chrome Extension 테스트:**
   - `chrome://extensions/`에서 확장 프로그램 새로고침
   - 팝업 열어서 UI 확인
   - 설정 페이지 접속 확인

3. **기능 테스트:**
   - 텍스트 입력 및 글자 수 카운터 동작 확인
   - 버튼 클릭 반응 확인
   - 로딩 스켈레톤 표시 확인

---

## Phase 4: 통합 및 테스트

**예상 소요시간:** 4-6시간

### ✅ Task 체크리스트

- [ ] **4.1** 전체 플로우 통합 테스트
- [ ] **4.2** 에러 핸들링 강화
- [ ] **4.3** 성능 최적화
- [ ] **4.4** 사용자 경험 개선
- [ ] **4.5** 크로스 브라우저 테스트
- [ ] **4.6** 보안 검증

### 📝 상세 구현 가이드

#### 4.1 전체 플로우 통합 테스트

**테스트 시나리오:**
1. 확장 프로그램 설치 후 첫 실행
2. API 키 설정 및 유효성 검증
3. 클립보드 텍스트 자동 인식
4. AI 변환 및 결과 표시
5. 결과 복사 및 사용량 차감
6. 일일 사용량 한도 도달 시 동작

#### 4.2 에러 핸들링 강화

**src/utils/errorHandler.ts:**
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    // 네트워크 오류
    if (error.message.includes('fetch')) {
      return new AppError(
        'Network error',
        'NETWORK_ERROR',
        '네트워크 연결을 확인해주세요.'
      )
    }
    
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      '알 수 없는 오류가 발생했습니다.'
    )
  }
  
  return new AppError(
    'Unknown error',
    'UNKNOWN_ERROR',
    '알 수 없는 오류가 발생했습니다.'
  )
}
```

#### 4.3 성능 최적화

**React.memo 적용:**
```typescript
// ResultCard.tsx
export default React.memo(ResultCard)

// TextInput.tsx  
export default React.memo(TextInput)

// ActionBar.tsx
export default React.memo(ActionBar)
```

**useCallback 최적화:**
```typescript
// App.tsx에서
const handleConvert = useCallback(async (text?: string) => {
  // ... 기존 로직
}, [state.inputText, state.remainingUsage])

const handleCopy = useCallback(async (text: string) => {
  await writeClipboard(text)
}, [])
```

#### 4.4 사용자 경험 개선

**Toast 알림 추가:**
```bash
npx shadcn@latest add toast
```

**src/hooks/useToast.ts:**
```typescript
import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error'
  }>>([])
  
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [])
  
  return { toasts, showToast }
}
```

### 🔍 검증 단계

1. **기능 테스트:**
   - 각 사용자 시나리오 단계별 실행
   - 에러 상황 의도적 발생시켜 핸들링 확인
   - 성능 측정 (로딩 시간, API 응답 시간)

2. **사용성 테스트:**
   - 실제 이메일/메신저 작성 상황에서 테스트
   - 다양한 텍스트 길이로 테스트
   - 네트워크 불안정 상황 테스트

---

## Phase 5: 배포 및 패키징

**예상 소요시간:** 2-3시간

### ✅ Task 체크리스트

- [ ] **5.1** 프로덕션 빌드 최적화
- [ ] **5.2** 아이콘 및 리소스 준비
- [ ] **5.3** manifest.json 최종 검토
- [ ] **5.4** 빌드 및 패키징
- [ ] **5.5** Chrome 웹스토어 등록 준비
- [ ] **5.6** 사용자 문서 작성

### 📝 상세 구현 가이드

#### 5.1 프로덕션 빌드 최적화

**vite.config.ts 프로덕션 설정:**
```typescript
export default defineConfig({
  // ... 기존 설정
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html'
      },
      output: {
        manualChunks: undefined, // Chrome Extension에서는 단일 청크 권장
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: false, // 프로덕션에서는 소스맵 제거
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true
      }
    }
  }
})
```

#### 5.2 아이콘 준비

아이콘 파일들을 `public/images/` 디렉토리에 준비:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)  
- `icon128.png` (128x128px)

#### 5.3 빌드 및 패키징

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la dist/

# ZIP 파일 생성 (Chrome 웹스토어 업로드용)
cd dist && zip -r ../business-message-extension.zip . && cd ..
```

#### 5.4 Chrome 웹스토어 등록 준비

**스토어 등록 필요 자료:**
- 확장 프로그램 ZIP 파일
- 스크린샷 (1280x800px) 최소 1개
- 아이콘 (128x128px)
- 상세 설명
- 개인정보처리방침 URL

### 🔍 최종 검증

1. **빌드 테스트:**
   ```bash
   npm run build
   npm run preview
   ```

2. **확장 프로그램 로드 테스트:**
   - `dist` 폴더를 Chrome에 로드
   - 모든 기능 정상 동작 확인

3. **성능 측정:**
   - 팝업 로딩 시간 < 300ms
   - API 응답 시간 < 3초
   - 번들 크기 < 500KB

---

## 트러블슈팅 및 FAQ

### 자주 발생하는 문제들

#### 1. Chrome Extension 개발 관련

**Q: 확장 프로그램이 로드되지 않아요**
```
A: manifest.json 구문 오류를 확인하세요.
   - JSON 형식이 올바른지 검증
   - 필수 필드들이 모두 있는지 확인
   - 파일 경로가 정확한지 확인
```

**Q: 클립보드 접근이 안돼요**
```
A: 권한 설정을 확인하세요.
   - manifest.json에 "clipboardRead", "clipboardWrite" 권한 추가
   - HTTPS 환경에서만 작동 (개발 중에는 localhost 가능)
```

#### 2. API 연동 관련

**Q: API 호출이 실패해요**
```
A: 다음 사항들을 확인하세요:
   1. API 키가 올바른지 확인
   2. host_permissions에 Google API 도메인 추가 확인
   3. CORS 정책 - Chrome Extension은 기본적으로 CORS 제한 없음
   4. 네트워크 연결 상태 확인
```

**Q: API 응답 파싱 오류가 발생해요**
```
A: 시스템 프롬프트를 검토하세요:
   - JSON 형식 강제 지시문이 명확한지 확인
   - 예외 처리 로직으로 다양한 응답 형식 대응
   - temperature 값 조정 (0.7 권장)
```

#### 3. 개발 환경 관련

**Q: Vite 빌드 오류가 발생해요**
```
A: 의존성 충돌을 확인하세요:
   - node_modules 삭제 후 npm install 재실행
   - Node.js 버전 확인 (v20+ 필요)
   - TypeScript 컴파일 오류 확인
```

**Q: shadcn/ui 컴포넌트가 스타일링되지 않아요**
```
A: Tailwind CSS 설정을 확인하세요:
   - tailwind.config.js content 경로 확인
   - CSS variables 설정 확인
   - 전역 CSS 파일 import 확인
```

### 성능 최적화 팁

1. **번들 크기 최소화:**
   - Tree-shaking 활용
   - 불필요한 의존성 제거
   - 코드 스플리팅 (단, Chrome Extension에서는 제한적)

2. **메모리 사용량 최적화:**
   - React.memo 활용
   - useCallback, useMemo 적절히 사용
   - 메모리 누수 방지 (이벤트 리스너 정리)

3. **로딩 속도 개선:**
   - 초기 렌더링 최적화
   - 지연 로딩 적용
   - 캐싱 전략 활용

### 추가 리소스

- **Chrome Extension 개발 가이드:** https://developer.chrome.com/docs/extensions/
- **Google Gemini API 문서:** https://ai.google.dev/docs
- **shadcn/ui 컴포넌트:** https://ui.shadcn.com/
- **React 성능 최적화:** https://react.dev/learn/render-and-commit

---

## 마무리

이 개발 가이드를 따라 단계별로 진행하면 '정중한 문장 도우미' Chrome Extension을 성공적으로 개발할 수 있습니다. 

각 Phase별로 체크리스트를 완료하고, 문제가 발생하면 트러블슈팅 섹션을 참조하세요. 개발 과정에서 궁금한 사항이 있으면 각 섹션에 명시된 참조 문서들을 확인하시기 바랍니다.

**성공적인 개발을 위한 마지막 조언:**
- 각 단계별로 충분한 테스트를 진행하세요
- 코드 품질을 위해 ESLint, Prettier를 적극 활용하세요
- 사용자 경험을 최우선으로 고려하세요
- 보안 요구사항을 절대 타협하지 마세요

화이팅! 🚀
