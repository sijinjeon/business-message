# 정중한 문장 도우미 (BCA Assistant) - v2.5.2 (2026)

**비즈니스 메시지 작성의 새로운 기준.**  
복사한 문장을 AI를 통해 정중한 비즈니스 표현으로 변환하거나, 웹페이지에서 선택한 텍스트를 즉시 번역/대체해주는 강력한 Chrome Extension입니다.

---

## 🚀 주요 기능

- **✨ 3가지 톤 자동 변환**: 격식(Formal), 일반(General), 친근(Friendly) 톤으로 즉시 변환
- **🌐 전문 번역 시스템**: 문맥을 파악하는 정밀한 번역 및 웹페이지 내 즉시 대체 지원
- **⌨️ 전역 단축키**: 브라우저 어디서든 단축키 하나로 텍스트 번역 및 톤 다듬기 실행 (인스턴트 액션)
- **📊 사용량 대시보드**: AI 호출 횟수, 상세 실행 로그, 추정 비용 정보를 한눈에 파악
- **🤖 멀티 AI 엔진**: Google Gemini 3.0, OpenAI GPT-5.2, Anthropic Claude 4.5 완벽 대응
- **⚡ 서비스 워커 최적화**: MV3 하트비트(Heartbeat) 메커니즘을 통한 안정적인 백그라운드 작동 보장
- **🔒 강화된 보안**: AES-GCM 256-bit 암호화로 API 키를 안전하게 보호
- **🛠️ 입력창 지원 강화**: Gmail, Google Docs 등 다양한 입력창에서 텍스트 선택 후 즉시 변환 지원

---

## 🛠 기술 스택 (2026)

| 카테고리 | 기술 |
|----------|------|
| **Frontend** | React 18, TypeScript 5.7 |
| **UI Framework** | shadcn/ui, Tailwind CSS, Lucide React |
| **Build Tool** | Vite 7 |
| **Architecture** | AI Orchestrator Pattern, Service Layer Architecture |
| **Platform** | Chrome Extension Manifest V3 |
| **Security** | AES-GCM 256-bit, PBKDF2 Key Derivation |

---

## 📂 프로젝트 구조

```text
business-message/
├── src/
│   ├── services/           # 비즈니스 로직 및 AI 통합
│   │   ├── ai/             # AIOrchestrator, Provider 어댑터
│   │   └── storage-service.ts
│   ├── background/         # Service Worker 및 명령어 핸들러
│   │   ├── index.ts        # 서비스 워커 진입점
│   │   └── commands.ts     # 단축키 처리 로직
│   ├── content/            # 웹페이지 DOM 조작
│   │   ├── index.ts        # 메시지 리스너
│   │   ├── replacer.ts     # 텍스트 선택/교체
│   │   └── toast.ts        # 알림 UI
│   ├── popup/              # 팝업 UI (톤 변환/번역)
│   ├── options/            # 설정 페이지 및 대시보드
│   ├── hooks/              # React Custom Hooks
│   ├── utils/              # 유틸리티 함수
│   ├── types/              # TypeScript 타입 정의
│   └── styles/             # 전역 CSS
├── docs/
│   ├── specs/              # 기능별 상세 스펙 문서
│   └── 260112_design/      # UI 디자인 프로토타입
├── images/                 # 확장 프로그램 아이콘
└── business-message-extension/  # 빌드 결과물
```

---

## 🔄 v2.5.2 변경사항 (2026.01.14)

### 개인정보처리방침 추가
- Chrome 웹 스토어 정책 준수를 위한 개인정보처리방침 문서 추가
- 한국어/영문 버전 동시 제공 (`docs/privacy-policy.html`, `docs/privacy-policy-en.html`)
- GitHub Pages 호스팅 지원

---

## 🔄 v2.5.1 변경사항 (2026.01.12)

### 단축키 기능 개선
- **input/textarea 지원 강화**: `window.getSelection()` 대신 `selectionStart/End`를 사용한 직접 텍스트 추출
- **React 프레임워크 호환**: 텍스트 교체 후 `input`, `change` 이벤트 발생으로 상태 동기화
- **activeTab 권한 활용**: 동적 Content Script 주입 방식 개선

### Service Worker 안정성
- 시작 시 등록된 단축키 상태 자동 로깅 (`logCommandsStatus()`)
- 하트비트 알람 상태 확인 강화 (30초 주기)
- Service Worker 업타임 모니터링

### 에러 핸들링 개선
- **제한된 페이지 감지**: `isRestrictedPage()` 함수로 chrome://, edge://, about:, 웹스토어 등 감지
- **시스템 알림**: `showNotification()` - Content Script 없이도 사용자 피드백 제공
- **동적 스크립트 주입**: `chrome.scripting.executeScript` + `insertCSS` 사용

### 디버깅 강화
| 컴포넌트 | 로그 Prefix | 주요 로그 내용 |
|----------|-------------|----------------|
| Background | `[BCA]` | 단축키 수신, 탭 정보, 메시지 전송 |
| Content Script | `[BCA Content]` | 메시지 수신, 선택 텍스트 정보 |
| Replacer | `[BCA Replacer]` | 텍스트 추출/교체 과정 |

### 프로젝트 정리
- 중복 파일 제거: `public/images/`, `.playwright-mcp/`, `bca_popup_v1.html`
- 스펙 문서 업데이트: 03_클립보드_연동.md, 00_개요_및_시스템_아키텍처.md

---

## ⌨️ 단축키 설정

Chrome에서 `chrome://extensions/shortcuts`로 이동하여 단축키를 설정합니다.

| 명령어 | 기본값 (Windows) | 기본값 (Mac) | 기능 |
|--------|------------------|--------------|------|
| `_execute_action` | Alt+Shift+C | Cmd+Shift+Y | 팝업 열기 |
| `instant-translation` | Ctrl+I | Cmd+Shift+K | 선택 텍스트 즉시 번역 |
| `instant-tone-conversion` | Ctrl+Shift+C | Cmd+Shift+C | 선택 텍스트 즉시 톤 변환 |

---

## 📖 문서 및 가이드

모든 상세 기능 및 아키텍처 정보는 [docs/specs/](./docs/specs/README.md)에서 확인할 수 있습니다.

| 문서 | 내용 |
|------|------|
| [00_개요_및_시스템_아키텍처](./docs/specs/00_개요_및_시스템_아키텍처.md) | 전체 시스템 구조 및 설계 철학 |
| [02_AI_통합](./docs/specs/02_AI_통합.md) | AIOrchestrator 패턴 및 프로바이더 어댑터 |
| [03_클립보드_연동](./docs/specs/03_클립보드_연동.md) | 텍스트 조작, 단축키 처리, 동적 주입 |
| [06_데이터베이스_스토리지](./docs/specs/06_데이터베이스_스토리지.md) | 스토리지 스키마 및 마이그레이션 |
| [10_입력창_텍스트_선택_변환_기능](./docs/specs/10_입력창_텍스트_선택_변환_기능.md) | 플로팅 팝업 기능 개발 명세 |

---

## ⚙️ 시작하기

### 요구사항
- Node.js 18+
- npm 9+

### 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 시작 (HMR 포함)
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```
빌드된 결과물은 `business-message-extension/` 폴더에 생성됩니다.

### 확장 프로그램 로드
1. Chrome에서 `chrome://extensions` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `business-message-extension/` 폴더 선택

### 코드 품질
```bash
npm run lint        # ESLint 검사
npm run type-check  # TypeScript 타입 체크
```

---

## 🔧 주요 파일 설명

### Background (Service Worker)
| 파일 | 설명 |
|------|------|
| `src/background/index.ts` | 서비스 워커 진입점, 하트비트 알람, 메시지 리스너 |
| `src/background/commands.ts` | 단축키 핸들러, Content Script 동적 주입 |

### Content Script
| 파일 | 설명 |
|------|------|
| `src/content/index.ts` | Background로부터 메시지 수신 및 라우팅 |
| `src/content/replacer.ts` | 텍스트 선택/교체 로직 (input/textarea, contentEditable 지원) |
| `src/content/toast.ts` | DOM 기반 토스트 알림 |

### Services
| 파일 | 설명 |
|------|------|
| `src/services/ai/ai-orchestrator.ts` | AI 요청 라우팅 및 응답 정규화 |
| `src/services/ai/*-provider.ts` | Gemini, OpenAI, Claude 프로바이더 어댑터 |
| `src/services/storage-service.ts` | chrome.storage.local 래퍼 및 마이그레이션 |

---

## 🛡️ 개인정보처리방침

📄 **[개인정보처리방침 전문 보기 (한국어)](./docs/privacy-policy.html)** | **[Privacy Policy (English)](./docs/privacy-policy-en.html)**

### 요약

| 항목 | 내용 |
|------|------|
| 서버 저장 | ❌ 없음 (모든 데이터는 로컬에만 저장) |
| 개인정보 수집 | ❌ 없음 (이름, 이메일 등 개인 식별 정보 수집 안 함) |
| 데이터 판매 | ❌ 없음 |
| API 키 보호 | ✅ AES-GCM 256-bit 암호화 |
| 사용자 데이터 제어 | ✅ 완전한 로컬 제어 |

### 상세 내용

- 사용자의 API 키는 브라우저 내부 저장소(`chrome.storage.local`)에 **AES-GCM 256-bit**로 암호화되어 저장됩니다.
- 입력한 텍스트는 AI 처리를 위해 각 API 엔드포인트로 전송되며, **당사 서버에는 어떠한 정보도 저장되지 않습니다**.
- 사용량 로그는 로컬에만 저장되며 최근 1,000개로 제한됩니다.

---

## 🐛 문제 해결

### 단축키가 작동하지 않는 경우
1. `chrome://extensions/shortcuts`에서 단축키가 설정되어 있는지 확인
2. 브라우저 내부 페이지(chrome://, edge://)에서는 작동하지 않음
3. 개발자 도구(F12) → Console에서 `[BCA]` 로그 확인

### Content Script가 로드되지 않는 경우
1. 페이지 새로고침 후 재시도
2. 확장 프로그램 비활성화 → 활성화
3. Background Service Worker 상태 확인 (`chrome://extensions`)

---

## 📜 라이선스

MIT License

---

**Made with ❤️ by SIREAL**  
**최종 업데이트**: 2026-01-14
