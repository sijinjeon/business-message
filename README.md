# 정중한 문장 도우미 (BCA Assistant) - v2.5.1 (2026)

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
- **🛠️ UI 개선**: 팝업 내 결과 리스트 스크롤 오류 수정 및 안정성 향상

---

## 🛠 기술 스택 (2026)

- **Frontend**: React 18, TypeScript 5.7
- **UI Framework**: shadcn/ui, Tailwind CSS, Lucide React
- **Build Tool**: Vite 7
- **Architecture**: AI Orchestrator Pattern, Service Layer Architecture
- **Platform**: Chrome Extension Manifest V3

---

## 📂 프로젝트 구조

```text
src/
├── services/           # 비즈니스 로직 및 AI 통합 (AIOrchestrator, StorageService)
├── background/         # 서비스 워커 및 전역 명령어 핸들러
├── content/            # 웹페이지 DOM 조작 및 UI 피드백 (Replacer, Toast)
├── popup/              # 메인 팝업 UI (톤 변환/번역 탭)
├── options/            # 설정 페이지 및 사용량 대시보드
├── hooks/              # 비즈니스 로직 추상화 React Hooks
├── utils/              # 유틸리티 (암호화, 클립보드, 번역 헬퍼)
└── types/              # 도메인별 TypeScript 정의
```

---

## 📖 문서 및 가이드

모든 상세 기능 및 아키텍처 정보는 [docs/specs/](./docs/specs/README.md)에서 확인할 수 있습니다.

1. [개요 및 시스템 아키텍처](./docs/specs/00_개요_및_시스템_아키텍처.md)
2. [AI 통합 기술 명세](./docs/specs/02_AI_통합.md)
3. [데이터베이스 및 스토리지 스펙](./docs/specs/06_데이터베이스_스토리지.md)

---

## ⚙️ 시작하기

### 개발 환경 설정
```bash
npm install
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```
빌드된 결과물은 `business-message-extension/` 폴더에 생성됩니다.

---

## 🛡️ 개인정보 처리 방침
- 사용자의 API 키는 브라우저 내부 저장소(`chrome.storage.local`)에 암호화되어 저장됩니다.
- 입력한 텍스트는 AI 처리를 위해 각 API 엔드포인트로 전송되며, 당사 서버에는 어떠한 정보도 저장되지 않습니다.

---

**Made with ❤️ by BCA Team**
