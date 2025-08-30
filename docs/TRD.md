
# 기술 요구 명세서 (TRD): 정중한 문장 도우미 (business-message)

> **문서 버전:** 1.0  
> **기준 PRD 버전:** 1.0  
> **작성일:** 2025-08-30  
> **대상 단계:** Phase 1 (MVP)

## 1. 개요 (Overview)

본 문서는 '정중한 문장 도우미' 크롬 확장 프로그램의 Phase 1 (MVP) 개발을 위한 기술적 요구사항과 아키텍처, 구현 지침을 정의합니다. PRD 1.0 버전에 명시된 기능들을 기술적으로 어떻게 구현할지에 대한 구체적인 내용을 다룹니다.

## 2. 시스템 아키텍처 (System Architecture)

본 프로젝트는 별도의 백엔드 서버 없이, 사용자의 브라우저 내에서 모든 기능이 동작하는 **서버리스(Serverless), 클라이언트 중심(Client-Side) 아키텍처**를 채택합니다.

  - **Client (Chrome Extension):**
      - UI 렌더링, 상태 관리, 사용자 입력 처리 등 모든 프론트엔드 로직을 담당합니다.
      - `Chrome Storage API`를 통해 사용자의 API 키와 설정값을 로컬에 안전하게 저장합니다.
      - 사용자의 클립보드에 접근하여 텍스트를 읽고 씁니다.
  - **External API (Google AI):**
      - 클라이언트에서 직접 Google Gemini API를 호출하여 텍스트 변환 기능을 수행합니다.
      - 모든 통신은 HTTPS를 통해 안전하게 이루어집니다.

<!-- end list -->

```
+---------------------------------+
|      User's Chrome Browser      |
|                                 |
|  +---------------------------+  |
|  |   Chrome Extension (React)|  |
|  |                           |  |
|  | - Popup UI                |  |
|  | - Settings UI             |  |
|  | - Clipboard Access        |  |
|  | - Local Storage Mgmt      |  |
|  +---------------------------+  |
|           ^       |           |
|           |       |           |
| (HTTPS)   |       v           |
|           |   +--------------------+
|           +-->| Google Gemini API  |
|               +--------------------+
+---------------------------------+
```

## 3. 프론트엔드 기술 명세 (Frontend Specifications)

### 3.1. 개발 환경 및 스택

  - **Manifest Version:** **V3** (Chrome Extension Manifest V3 최신 표준)
  - **UI Framework:** **React.js (v18+)** - React 19도 지원, 최신 Hooks 및 기능 활용
  - **Language:** **TypeScript**
  - **Bundler:** **Vite (v7.0+)** - Chrome Extension 개발에 최적화된 빌드 도구
  - **Styling:** CSS Modules 또는 Styled-Components (컴포넌트 스코프 스타일링)
  - **Chrome Extension Plugin:** `@crxjs/vite-plugin` 또는 `vite-plugin-web-extension` (HMR 지원)

### 3.2. Chrome Extension 설정 (`manifest.json`)

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
    "default_popup": "index.html",
    "default_title": "정중한 문장 도우미"
  },
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  "options_page": "options.html",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 3.3. 컴포넌트 구조

  - **`Popup.tsx`**: 메인 팝업 UI의 컨테이너 컴포넌트
      - 클립보드 텍스트 조회 및 API 호출 트리거링
      - 전체 상태(로딩, 에러, 결과) 관리
  - **`TextInput.tsx`**: 원본 텍스트를 표시하고 수동 입력을 받는 컴포넌트
      - `textarea` 엘리먼트 포함
      - 글자 수 카운터 표시
  - **`ResultCard.tsx`**: 톤별 변환 결과를 표시하는 재사용 가능한 컴포넌트
      - `props`: `tone` (e.g., '격식'), `text` (변환된 문장)
      - 개별 복사 버튼 로직 포함
  - **`ActionBar.tsx`**: '다시 생성' 등 공통 액션 버튼을 포함하는 컴포넌트
  - **`Settings.tsx`**: 옵션 페이지(`options.html`)의 메인 컴포넌트
      - API 키 입력 필드 및 저장 로직
      - API 키 유효성 검사 버튼 및 로직

### 3.4. 핵심 로직 구현

  - **클립보드 연동:**
      - 팝업이 열릴 때 `navigator.clipboard.readText()`를 호출하여 클립보드의 텍스트를 비동기적으로 가져옵니다.
      - 사용자가 '복사하기' 버튼을 클릭하거나, 기본 결과가 생성되었을 때 `navigator.clipboard.writeText(text)`를 호출하여 클립보드에 씁니다.
      - Manifest V3에서 클립보드 권한은 `clipboardRead`, `clipboardWrite`로 명시적으로 선언해야 합니다.
  - **상태 관리:** 
      - React 18+ Hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`)를 활용합니다.
      - React 19의 새로운 Hooks (`use`, `useOptimistic`, `useActionState`) 활용 고려
      - 복잡도가 낮으므로 Redux 등 외부 라이브러리는 불필요합니다.
  - **에러 경계:** React의 Error Boundaries를 활용하여 예외 상황을 처리합니다.

## 4. API 연동 명세 (API Integration Specifications)

### 4.1. 대상 API

  - **Service:** **Google AI (Gemini API)**
  - **Model:** `gemini-2.5-flash-lite` (비용 및 속도 고려)

### 4.2. API 요청 (Request)

  - **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
  - **Method:** `POST`
  - **Headers:** 
      - `Content-Type: application/json`
      - `Authorization: Bearer [API_KEY]` 또는 `x-goog-api-key: [API_KEY]`
  - **Body (Payload) 구조:**

<!-- end list -->

```json
{
  "contents": [{
    "parts": [{
      "text": "Your system prompt here. The user's text to be converted is: [사용자 입력 텍스트]"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024,
    "candidateCount": 1,
    "topK": 40,
    "topP": 0.95
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

### 4.3. 시스템 프롬프트 (System Prompt)

API 요청 시 `text` 필드에 아래와 같은 구조의 시스템 프롬프트를 포함하여 일관된 결과 품질을 보장합니다.

````text
# Role
당신은 한국의 직장 문화와 커뮤니케이션에 매우 능숙한 AI 어시스턴트입니다.

# Instruction
주어진 '원본 텍스트'를 아래 '출력 형식'에 맞춰 세 가지 톤으로 변환해주세요. 각 톤은 한국의 업무 환경에 적합해야 하며, 자연스럽고 명확하게 작성해야 합니다.

# Tones
1.  **격식 (Formal):** 상사, 외부 고객, 공식적인 문서에 사용하는 매우 정중하고 격식 있는 톤.
2.  **일반 (General):** 일반적인 동료와의 협업, 팀 내 커뮤니케이션에 사용하는 정중하지만 부드러운 톤.
3.  **친근 (Friendly):** 친한 동료와의 일상적인 대화에 사용하는 간결하고 친근한 톤.

# Output Format
반드시 아래와 같은 JSON 형식으로만 응답해야 합니다. 다른 설명은 절대 추가하지 마세요.
```json
{
  "formal": "여기에 격식있는 톤의 변환 결과를 작성하세요.",
  "general": "여기에 일반적인 동료 톤의 변환 결과를 작성하세요.",
  "friendly": "여기에 친근한 톤의 변환 결과를 작성하세요."
}
````

# Original Text

{{사용자_입력_텍스트}}

````

### 4.4. API 응답 (Response) 처리

- 응답받은 JSON 객체를 파싱하여 각 키(`formal`, `general`, `friendly`)에 해당하는 값을 UI의 각 `ResultCard`에 렌더링합니다.
- `formal` 키의 값은 렌더링과 동시에 사용자의 클립보드에 자동으로 복사합니다.

## 5. 데이터 및 스토리지 (Data & Storage)

- **Storage API:** `chrome.storage.local` 사용 (Manifest V3 표준)
- **저장 데이터 스키마:**

```typescript
interface AppStorage {
  userApiKey: string; // 사용자의 암호화된 API 키
  dailyUsage: {
    date: string; // 'YYYY-MM-DD' 형식 (ISO 8601)
    count: number; // 사용 횟수
  };
  settings: {
    preferredModel: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash-lite';
    temperature: number; // 0.1 ~ 1.0
    maxOutputTokens: number; // 기본 1024
  };
}
```

  - **사용량 추적 로직:**
      - API 호출이 성공할 때마다 `chrome.storage.local`에서 `dailyUsage` 데이터를 조회합니다.
      - 저장된 `date`가 오늘 날짜와 다르면 `count`를 1로 초기화하고 `date`를 오늘 날짜로 업데이트합니다.
      - 오늘 날짜와 같으면 `count`를 1 증가시킵니다.
      - `count`가 5를 초과하면 API 호출을 막고 사용자에게 안내 메시지를 표시합니다.
      - Storage API는 비동기로 동작하므로 `async/await` 패턴을 사용합니다.

## 6. 보안 요구사항 (Security Requirements)

  - **API 키 관리:**
      - 사용자가 입력한 API 키는 `chrome.storage.local`에 저장하기 전, Web Crypto API (`crypto.subtle`)를 사용한 AES-GCM 암호화를 적용합니다.
      - 암호화 키는 확장 프로그램 ID와 사용자 고유 정보를 조합하여 생성합니다.
      - API 키 유효성 검증을 위해 Gemini API에 테스트 요청을 보내 응답을 확인합니다.
  - **네트워크 보안:**
      - 모든 API 통신은 HTTPS를 통해 이루어집니다.
      - `host_permissions`에 Google API 도메인만 명시적으로 허용합니다.
      - Content Security Policy (CSP)를 통해 외부 스크립트 실행을 차단합니다.
  - **데이터 처리:**
      - PRD에 명시된 바와 같이, 사용자 입력 텍스트 및 변환 결과는 어떤 형태로든 로컬 저장되지 않습니다.
      - 모든 처리는 실시간으로 API를 통해 이루어지며, 데이터는 메모리에서만 휘발성으로 관리됩니다.
      - 민감한 정보는 개발자 도구 콘솔에 로그로 출력하지 않습니다.

## 7. 에러 핸들링 (Error Handling)

| 상황 | 트리거 | 시스템 처리 | 사용자 피드백 |
| --- | --- | --- | --- |
| **API 키 오류** | API 응답 `401 Unauthorized` 또는 `403 Forbidden` | API 호출 중단 | "API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요." |
| **API 서버 오류** | API 응답 `5xx` | 재시도 로직 비활성화, '다시 생성' 버튼 활성화 | "AI 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." |
| **네트워크 오류** | `fetch` API 호출 실패 (e.g., `offline`) | 로딩 상태 해제 | "네트워크 연결을 확인해주세요." |
| **클립보드 비어있음** | `navigator.clipboard.readText()` 결과가 `null` 또는 `""` | API 호출 미실행 | "변환할 텍스트를 복사하거나, 직접 입력해주세요." (플레이스홀더) |
| **사용량 초과** | `dailyUsage.count > 5` | API 호출 미실행 | "오늘의 무료 사용량(5회)을 모두 사용하셨습니다." |

## 8. 성능 요구사항 (Performance Requirements)

  - **팝업 로딩 속도:** 
      - 확장 프로그램 아이콘 클릭 후 팝업 UI가 렌더링 되기까지 300ms 이내를 목표로 합니다.
      - React 18+의 Concurrent Features와 Vite의 번들 최적화를 활용합니다.
  - **API 응답 시간:** 
      - API 요청부터 클라이언트가 응답을 받기까지의 평균 시간을 2초 이하로 유지합니다.
      - `gemini-2.0-flash-exp` 모델의 향상된 속도를 활용합니다.
      - 네트워크 타임아웃을 10초로 설정하여 응답성을 보장합니다.
  - **리소스 사용량:** 
      - Manifest V3의 Service Worker 모델을 활용하여 백그라운드 리소스 사용량을 최소화합니다.
      - 번들 크기를 500KB 이하로 유지하여 로딩 속도를 최적화합니다.
      - Tree-shaking과 코드 스플리팅을 통해 불필요한 코드를 제거합니다.

## 9. 개발 환경 설정 (Development Environment Setup)

### 9.1. Vite 설정 (`vite.config.ts`)

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

### 9.2. TypeScript 설정 (`tsconfig.json`)

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

### 9.3. 패키지 설정 (`package.json`)

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

### 9.4. 프로젝트 구조

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
