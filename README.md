# 정중한 문장 도우미 (Business Message Helper)

클립보드에 복사된 문장을 AI를 통해 정중한 비즈니스 표현으로 변환하는 Chrome Extension입니다.

## 🚀 주요 기능

- **클립보드 자동 인식**: 복사한 텍스트를 자동으로 감지하여 변환 준비
- **3가지 톤 변환**: 격식(Formal), 일반(General), 친근(Friendly) 톤으로 변환
- **전문 번역 시스템**: 즉시 번역(대체) 기능 지원
- **멀티 AI 엔진 지원**: Google Gemini, OpenAI, Anthropic(Claude) 연동 가능
- **원클릭 복사 및 대체**: 변환된 결과를 즉시 복사하거나 웹페이지 텍스트를 바로 대체
- **보안 강화**: AES-GCM 256-bit 암호화 저장 및 개인정보 보호

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **UI Library**: shadcn/ui, Tailwind CSS, Lucide React
- **Build Tool**: Vite 7
- **AI Engines**: Google Gemini 2.0, OpenAI GPT-4o-mini, Anthropic Claude 3.5
- **Platform**: Chrome Extension Manifest V3

## 📦 설치 방법

### 개발 환경 설정

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd business-message
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **Chrome에서 확장 프로그램 로드**
   - Chrome에서 `chrome://extensions/` 접속
   - "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `dist` 폴더 선택

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## ⚙️ 설정 방법

1. **Google AI Studio에서 API 키 발급**
   - [Google AI Studio](https://ai.google.dev/) 접속
   - Google 계정으로 로그인
   - "Get API Key" → "Create API Key" 선택
   - 생성된 API 키 복사

2. **확장 프로그램 설정**
   - Chrome 툴바의 확장 프로그램 아이콘 우클릭
   - "옵션" 선택 또는 팝업에서 설정 아이콘 클릭
   - API 키 입력 및 "연결 테스트" 실행
   - "저장" 버튼 클릭

## 📖 사용 방법

1. **텍스트 복사**: 변환하고 싶은 문장을 `Ctrl+C`로 복사
2. **확장 프로그램 실행**: Chrome 툴바의 아이콘 클릭
3. **자동 변환**: 클립보드 텍스트가 자동으로 3가지 톤으로 변환
4. **결과 사용**: 원하는 톤의 "복사하기" 버튼 클릭 또는 기본값(격식) 자동 복사 활용

## 🔒 개인정보 보호

- **API 키**: AES-GCM 암호화로 브라우저에만 저장
- **텍스트 데이터**: Google AI 서비스로만 전송, 별도 저장 없음
- **사용량 추적**: 로컬 스토리지에서만 관리

## 📊 성능 지표

- **팝업 로딩**: 300ms 이내
- **API 응답**: 평균 2초 이하
- **번들 크기**: 약 68KB (압축)

## 🛠 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# TypeScript 타입 체크
npm run type-check

# ESLint 검사
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
business-message/
├── src/
│   ├── background/      # 서비스 워커 및 단축키 핸들러
│   ├── content/         # 웹페이지 DOM 조작 (번역/대체)
│   ├── popup/           # 팝업 UI (톤 변환/수동 번역 탭)
│   ├── options/         # 설정 페이지 (멀티 AI 설정)
│   ├── components/      # 공용 UI 컴포넌트
│   ├── services/        # AI 연동 및 비즈니스 로직
│   ├── utils/           # 유틸리티 (암호화, 클립보드 등)
│   ├── types/           # TypeScript 타입 정의
│   └── styles/          # 전역 스타일
├── docs/                # 프로젝트 문서
│   └── specs/           # 기능 상세 명세서 (Latest)
├── manifest.json        # Chrome Extension 설정
└── dist/               # 빌드 결과물
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 제안사항이 있으시면 [Issues](https://github.com/your-repo/issues)에 등록해 주세요.

---

**Made with ❤️ for better business communication**
