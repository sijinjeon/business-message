# 리팩토링 상세 설계 및 실행 가이드 (Technical Detail)

> **대상**: 프론트엔드 및 확장 프로그램 개발자  
> **기술 스택**: React, TypeScript, TanStack Query, Vite, Chrome API (MV3)  
> **접근 방식**: 도메인 중심 설계(DDD) 및 테스트 주도 개발(TDD)

---

## 1. [아키텍처 설계] To-Be 구조

현재의 파편화된 구조를 **서비스 레이어 중심**으로 개편합니다.

### 1.1 권장 폴더 구조
```text
src/
├── api/                # AI API Wrappers (Gemini, OpenAI, Claude)
├── services/           # Business Logic (Storage, AI Orchestrator)
│   ├── ai-core.ts      # 통합 AI 서비스
│   ├── auth.ts         # API Key & Crypto
│   └── settings.ts     # Configuration manager
├── hooks/              # Shared React Hooks (useSettings, useAI)
├── store/              # Global State (TanStack Query, Zustand)
├── content/            # Content Scripts (Divided by features)
│   ├── index.ts        # Entry & Message Bus
│   ├── modules/        # replacer, inliner, toast
├── background/         # Service Worker
│   ├── index.ts        # Entry
│   └── handlers/       # command, runtime-message handlers
└── components/         # Atomic Components (shadcn/ui)
```

### 1.2 모듈화 전략
- **통합 AI 인터페이스**: `generateAIResponse`를 `Adapter Pattern`으로 구현하여 제공자별 응답 형식을 일원화.
- **메시지 버스**: Background와 Content Script 간의 메시지 타입을 `enum` 또는 `literal type`으로 엄격히 관리.

---

## 2. [데이터베이스 스펙] 스토리지 관리 고도화

크롬 확장 프로그램의 특성상 `chrome.storage.local`을 메인 DB로 사용하며, Supabase의 RLS 패턴을 모사한 데이터 접근 레이어를 구축합니다.

### 2.1 데이터 스키마 (DDL 가상화)
```typescript
interface DB_Schema {
  api_keys: Record<AIProvider, string>; // AES-256 Encrypted
  user_settings: {
    active_provider: AIProvider;
    active_models: Record<AIProvider, string>;
    translation: TranslationSettings;
    instant_conversion: ToneStyle;
  };
  usage_stats: {
    daily_count: number;
    last_reset: string;
  };
}
```

### 2.2 보안 및 마이그레이션
- **보안**: 모든 스토리지 접근은 `StorageService` 클래스를 통해서만 가능하도록 강제 (Encapsulation).
- **자동 마이그레이션**: 앱 구동 시 `version` 체크를 통해 스키마 변경 건을 자동 감지하고 데이터 변환 수행.

---

## 3. [상태 관리 및 패턴]

### 3.1 TanStack Query 적용
- **이유**: AI API 호출은 비동기 작업이므로 로딩, 에러, 캐싱 상태를 효율적으로 관리하기 위함.
- **적용**: `useMutation`을 사용하여 톤 변환/번역 요청 처리.

### 3.2 공통 설계 패턴
- **FormBuilder**: 설정 페이지의 반복적인 Input/Select 구문을 스키마 기반으로 렌더링하도록 추상화.
- **Interceptor**: AI 호출 전후로 로그 기록 및 에러 토스트 자동 노출.

---

## 4. [실행 체크리스트] 단계별 리팩토링 순서

### Step 1: 인프라 및 타입 정비
- [ ] `src/types/`를 기능별로 분리 (`ai.ts`, `storage.ts`, `ui.ts`).
- [ ] `StorageService` 정적 클래스 구현 (Get/Set 래퍼).

### Step 2: AI 서비스 레이어 통합
- [ ] `api.ts`와 `ai-service.ts`를 하나로 병합.
- [ ] 각 엔진별 `callGemini`, `callOpenAI` 등을 비공개 메서드로 전환.

### Step 3: UI 상태 관리 개편
- [ ] `Popup`과 `Settings`의 거대 State를 TanStack Query 또는 전역 Store로 분리.
- [ ] 비즈니스 로직을 커스텀 훅(`useToneConversion`, `useTranslation`)으로 추출.

### Step 4: 테스트 코드 작성 (Vitest)
- [ ] `buildSystemPrompt` 유닛 테스트: 줄바꿈 보존 여부 검증.
- [ ] `extractJson` 유닛 테스트: 다양한 AI 응답 형식 파싱 검증.

---

## 5. [Cursor AI 활용] 코딩 프롬프트 팁
리팩토링 시 Cursor AI에게 다음과 같이 지시하세요:
> "현재 `App.tsx`에 있는 변환 로직을 `useToneConversion` 커스텀 훅으로 분리해줘. `src/services/ai-core.ts`를 사용하고 로딩 상태는 TanStack Query를 적용해."





