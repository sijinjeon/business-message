# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

BCA (Business Communication Assistant)는 AI 기반 톤 변환 및 번역 기능을 제공하는 Chrome Extension (Manifest V3)입니다. Google Gemini, OpenAI GPT, Anthropic Claude API를 통합하여 텍스트를 격식(Formal), 일반(General), 친근(Friendly) 톤으로 변환하고 문맥을 고려한 전문 번역을 제공합니다.

**기술 스택**: React 18 + TypeScript 5.7 + Vite 7 + Tailwind CSS + shadcn/ui

## 개발 명령어

### 빌드 및 개발
```bash
npm run dev          # 개발 서버 시작 (HMR 포함, 포트 5173)
npm run build        # 타입 체크 후 business-message-extension/ 폴더에 빌드
npm run preview      # 프로덕션 빌드 미리보기
```

### 코드 품질
```bash
npm run lint         # ESLint 검사 (최대 경고 0개)
npm run type-check   # TypeScript 타입 체크 (emit 없이)
```

### 확장 프로그램 로드
`npm run build` 실행 후, Chrome에서 `business-message-extension/` 디렉토리를 압축해제된 확장 프로그램으로 로드하세요.

## 개발 워크플로우

### 빌드 테스트 및 커밋 규칙
빌드 테스트를 수행할 때는 다음 규칙을 따르세요:

1. **빌드 성공 시 반드시 커밋**: `npm run build`가 성공할 때마다 변경 내용을 커밋합니다.
2. **커밋 메시지 형식**: 빌드한 내용을 요약 정리하여 명확한 커밋 메시지를 작성합니다.
   - 어떤 기능이 추가/수정되었는지
   - 어떤 버그가 수정되었는지
   - 어떤 파일들이 영향을 받았는지
3. **커밋 전 검증**: 빌드 성공 후 lint 검사도 통과하는지 확인합니다.

```bash
# 빌드 테스트 및 커밋 워크플로우
npm run build        # 빌드 성공 확인
npm run lint         # 린트 검사 통과 확인
git add .            # 변경사항 스테이징
git commit -m "feat/fix/refactor: 변경 내용 요약"
```

**커밋 메시지 예시**:
- `feat: 팝업 UI에 다크 모드 토글 추가`
- `fix: Content Script 토스트 z-index 렌더링 버그 수정`
- `refactor: AI 프로바이더 에러 핸들링 로직 개선`

## 아키텍처 개요

### Service Layer 패턴
코드베이스는 UI와 비즈니스 로직을 서비스 레이어를 통해 엄격하게 분리합니다:

- **AI Service** (`src/services/ai/`): 멀티 프로바이더 AI 통합을 위한 Orchestrator 패턴
  - `AIOrchestrator`: 요청을 적절한 프로바이더로 라우팅하고 응답을 정규화
  - `BaseAIProvider`: 모든 프로바이더가 상속하는 추상 클래스
  - 프로바이더 구현체: `GeminiProvider`, `OpenAIProvider`, `ClaudeProvider`

- **Storage Service** (`src/services/storage-service.ts`): `chrome.storage.local`을 래핑하며 자동 모델 ID 마이그레이션 로직 포함

### Chrome Extension 아키텍처

**Background Service Worker** (`src/background/index.ts`):
- MV3 하트비트 메커니즘: `chrome.alarms` (0.5분 간격)로 서비스 워커 활성 상태 유지
- `commands.ts`를 통한 전역 단축키 처리
- Content Script로부터의 AI API 호출 라우팅
- `logCommandsStatus()`: 등록된 단축키 상태 자동 로깅

**Background Commands** (`src/background/commands.ts`):
- `isRestrictedPage()`: chrome://, edge://, about: 등 제한된 페이지 감지
- `showNotification()`: Content Script 없이도 시스템 알림 표시
- `ensureContentScriptReady()`: activeTab 권한 활용 동적 스크립트 주입
- 동적 CSS/JS 주입: `chrome.scripting.insertCSS()` + `executeScript()`

**Content Scripts** (`src/content/`):
- `index.ts`: Background로부터 메시지 수신 및 라우팅 (`[BCA Content]` 로그)
- `replacer.ts`: 번역 결과를 DOM에 주입 (`[BCA Replacer]` 로그)
  - input/textarea: `selectionStart/End`로 직접 텍스트 추출
  - contentEditable: `window.getSelection()` 사용
  - React 호환: 텍스트 교체 후 `input`, `change` 이벤트 발생
- `toast.ts`: 알림 토스트 표시 (z-index 99999999 사용)

**Popup UI** (`src/popup/`):
- 톤 변환 및 번역을 위한 메인 사용자 인터페이스
- 탭 기반 레이아웃 (톤 변환/번역)

**Options Page** (`src/options/`):
- 설정 구성 및 사용량 대시보드
- API 호출 로그, 추정 비용, 일일 사용량 통계 표시

### AI 통합 세부사항

**톤 변환 작업 (Tone Conversion)**:
- `formal`, `general`, `friendly` 키를 가진 JSON 응답 예상
- `AIOrchestrator.parseJson()`이 마크다운 블록에서 JSON을 추출하거나 `{}`를 추적하여 파싱
- UI로 반환하기 전 필수 필드 검증

**번역 작업 (Translation)**:
- 순수 텍스트 반환
- `utils/translation.ts`를 사용한 언어 감지
- `preserveLineBreaks` 설정이 활성화되면 줄바꿈 보존

**모델 마이그레이션 로직**:
`StorageService.getAll()` 메서드가 구형 모델 ID를 최신 모델 ID로 자동 마이그레이션합니다:
- `gemini-1.5-flash` → `gemini-2.5-flash`
- `gpt-4o-mini` → `gpt-5.2`
- `claude-3-5-sonnet-latest` → `claude-3-5-sonnet-20241022`
- `claude-4-5-sonnet` → `claude-sonnet-4-5-20250929`

### 타입 시스템

타입은 `src/types/`에 조직화되어 있으며 index 파일을 통해 재export됩니다:
- `ai.ts`: AI 프로바이더, 작업, 서비스 옵션
- `storage.ts`: AppStorage 스키마, 설정, 사용량 로그
- `ui.ts`: UI 컴포넌트 타입

경로 별칭: `@/`는 `src/`로 매핑됩니다 (vite.config.ts 및 tsconfig.json 설정)

## 중요 구현 사항

### Content Script 스타일링
UI 요소를 주입하는 Content Script를 수정할 때:
- 주입된 컨테이너에는 `display: block` 대신 `display: inline-block` 사용 (호스트 페이지의 flex/grid 레이아웃 파괴 방지)
- 명시적으로 `box-sizing: border-box` 및 `max-width: 100%` 설정
- z-index는 적절한 값 유지 (99999999 사용, MAX_SAFE_INTEGER는 렌더링 버그 유발)

### input/textarea 텍스트 선택 처리
`window.getSelection()`은 input/textarea에서 신뢰할 수 없으므로 직접 처리:
```typescript
// replacer.ts의 prepareSelectionForReplacement()
if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
  const start = activeElement.selectionStart ?? 0;
  const end = activeElement.selectionEnd ?? 0;
  return activeElement.value.substring(start, end);
}
```

텍스트 교체 후 React 등 프레임워크와의 호환성을 위해 이벤트 발생:
```typescript
activeElement.dispatchEvent(new Event('input', { bubbles: true }));
activeElement.dispatchEvent(new Event('change', { bubbles: true }));
```

### 스토리지 및 상태 관리
- 모든 설정/키는 `chrome.storage.local`에 저장 (API 키는 `utils/crypto.ts`로 암호화)
- 직접 chrome.storage 호출 대신 `StorageService` 클래스 메서드 사용
- 사용량 로그는 최대 1000개 항목으로 제한되며 토큰 수 + 비용 추정 포함

### Background Service Worker
- MV3 서비스 워커는 30초 비활동 후 종료될 수 있음
- BCA는 `chrome.alarms.create('bca-heartbeat', { periodInMinutes: 0.5 })`로 종료 방지
- Content Script 통신: `action: 'CALL_AI_API'`로 런타임 메시징 사용

### 동적 Content Script 주입 (v2.5.1)
activeTab 권한을 활용한 동적 주입 방식:
```typescript
// commands.ts의 ensureContentScriptReady()
await chrome.scripting.insertCSS({
  target: { tabId },
  files: ['styles/global.css']
});
await chrome.scripting.executeScript({
  target: { tabId },
  files: ['scripts/content.js']
});
```

### 빌드 설정
- 출력 디렉토리: `business-message-extension/`
- Terser 압축으로 프로덕션 빌드에서 console.log 제거
- 프로덕션 빌드에 소스맵 미포함
- `@crxjs/vite-plugin`을 사용하여 적절한 MV3 번들링

## 주요 패턴

### 새로운 AI 프로바이더 추가
1. `src/services/ai/`에 `BaseAIProvider`를 상속하는 프로바이더 클래스 생성
2. API별 로직으로 `call()` 메서드 구현
3. `AIOrchestrator.providers` 매핑에 추가
4. `models.ts`의 `AI_MODELS` 업데이트
5. 필요시 `StorageService.getAll()`에 모델 마이그레이션 로직 추가

### 인스턴트 액션 처리 (단축키)
1. `manifest.json`의 `commands`에 명령어 정의
2. `src/background/commands.ts`에 핸들러 추가
3. Content Script가 메시지를 수신하여 `replacer.ts` 또는 `toast.ts` 호출

**단축키 처리 흐름**:
```
사용자 단축키 입력
    ↓
chrome.commands.onCommand (background/commands.ts)
    ↓
isRestrictedPage() 체크 → 제한된 페이지면 showNotification()
    ↓
ensureContentScriptReady() → 동적 CSS/JS 주입
    ↓
chrome.tabs.sendMessage() → Content Script로 메시지 전송
    ↓
prepareSelectionForReplacement() → 선택 텍스트 추출
    ↓
AIOrchestrator.call() → AI API 호출
    ↓
replaceSelectedText() → 결과 텍스트 교체
```

## 디버깅

### 로그 Prefix 규칙
- `[BCA]`: Background Service Worker (commands.ts, index.ts)
- `[BCA Content]`: Content Script (content/index.ts)
- `[BCA Replacer]`: Replacer 모듈 (content/replacer.ts)

### 단축키 문제 해결
1. `chrome://extensions/shortcuts`에서 단축키 설정 확인
2. Background Service Worker 콘솔에서 `[BCA] Command received:` 로그 확인
3. 제한된 페이지 여부 확인 (chrome://, edge://, about:, 웹스토어 등)
4. Content Script 로드 상태 확인 (`[BCA] Content script ready:` 로그)

## 문서

상세 스펙은 `docs/specs/`에 있습니다:
- `00_개요_및_시스템_아키텍처.md`: 시스템 아키텍처 개요
- `02_AI_통합.md`: AI 통합 세부사항, 모델 스펙, 가격 정보
- `03_클립보드_연동.md`: 텍스트 조작, 단축키 처리, 동적 주입
- `06_데이터베이스_스토리지.md`: 스토리지 스키마 및 마이그레이션 전략
- `10_입력창_텍스트_선택_변환_기능.md`: 플로팅 팝업 기능 개발 명세

알려진 UI 렌더링 이슈 및 수정사항은 `BUGFIX_INSTRUCTIONS.md`를 참고하세요 (특히 Tailwind 스코핑 및 Content Script 스타일링).

---

**최종 업데이트**: 2026-01-12 (v2.5.1)
