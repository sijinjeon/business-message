# PRD: 번역 기능 추가 (Translation Feature)

> **문서 버전**: 2.0  
> **작성일**: 2025-12-25  
> **기존 버전**: 1.0 (정중한 문장 도우미)  
> **추가 기능**: AI 기반 전문 번역 기능

---

## 목차

1. [개요](#1-개요)
2. [목표](#2-목표)
3. [기능 명세](#3-기능-명세)
4. [사용자 인터페이스](#4-사용자-인터페이스)
5. [단축키 시스템](#5-단축키-시스템)
6. [번역 전문가 모드](#6-번역-전문가-모드)
7. [언어 감지 및 처리](#7-언어-감지-및-처리)
8. [설정 관리](#8-설정-관리)
9. [기술 요구사항](#9-기술-요구사항)
10. [사용자 플로우](#10-사용자-플로우)
11. [성공 지표](#11-성공-지표)

---

## 1. 개요

### 1.1 제품 진화

**기존 제품 (v1.0)**:
- 이름: 정중한 문장 도우미
- 기능: 한국 직장 문화에 맞는 톤 변환 (Formal, General, Friendly)

**새 제품 (v2.0)**:
- 이름: **비즈니스 커뮤니케이션 어시스턴트**
- 기능: 
  1. ✅ 정중한 문장 변환 (기존)
  2. 🆕 **AI 기반 전문 번역** (신규)

### 1.2 추가 기능 개요

**번역 기능**은 사무직, IT, 생산성 분야의 전문가들이 다양한 언어로 작성된 컨텐츠를 빠르고 정확하게 번역할 수 있도록 지원합니다.

**핵심 차별점**:
- 🎯 **전문 분야별 번역**: 22개 전문가 모드 제공
- 🔍 **자동 언어 감지**: 어떤 언어든 자동 인식
- ⚡ **원클릭 번역**: 클립보드 복사 → 단축키 → 번역 완료
- 🎓 **컨텍스트 기반**: 단어부터 긴 문단까지 문맥 이해

---

## 2. 목표

### 2.1 비즈니스 목표

**핵심 목표**:
- v2.0 출시 3개월 내 번역 기능 사용률 70% 달성
- 일일 활성 사용자(DAU) 1,000명 → 3,000명 증가
- 사용자 평균 세션 시간 2배 증가

**확장 목표**:
- 글로벌 시장 진출 기반 마련
- 프리미엄 기능 차별화 요소 확보

### 2.2 사용자 목표

**타겟 사용자**:
1. **개발자**: GitHub, Stack Overflow, 기술 문서 번역
2. **비즈니스 전문가**: 이메일, 보고서, 계약서 번역
3. **연구자/학생**: 논문, 학술 자료 번역
4. **콘텐츠 크리에이터**: SNS, 블로그 게시물 번역
5. **게이머**: 게임 채팅, 공략 번역

**사용자가 해결하려는 문제**:
- ❌ Google 번역은 전문 용어를 부정확하게 번역
- ❌ 여러 번역기를 오가며 최적 번역 찾기 번거로움
- ❌ 문맥을 고려하지 않은 직역
- ❌ 전문 분야별 뉘앙스 손실

**우리의 솔루션**:
- ✅ 22개 전문가 모드로 분야별 최적화
- ✅ AI가 문맥을 이해하고 자연스럽게 번역
- ✅ 원클릭으로 빠른 번역
- ✅ 사무직/IT 중심 전문 용어 데이터베이스

---

## 3. 기능 명세

### 3.1 기능 모드 구분

| 모드 | 단축키 | 기능 | 우선순위 |
|------|--------|------|----------|
| **정중한 문장 모드** | `Cmd+Option+C` (Mac)<br>`Ctrl+Alt+C` (Win) | 한국어 톤 변환<br>(Formal/General/Friendly) | P0 (기존) |
| **번역 모드** | `Cmd+Option+D` (Mac)<br>`Ctrl+Alt+D` (Win) | 다국어 전문 번역 | P0 (신규) |

### 3.2 번역 기능 상세

#### 3.2.1 지원 언어

**타겟 언어** (사용자가 번역 결과로 받을 언어):
1. 🇰🇷 한국어 (Korean)
2. 🇺🇸 영어 (English)
3. 🇯🇵 일본어 (Japanese)
4. 🇨🇳 중국어 간체 (Simplified Chinese)

**소스 언어** (자동 감지):
- ✅ 위 4개 언어 + 기타 주요 언어 (스페인어, 프랑스어, 독일어 등)
- ✅ AI가 자동으로 언어 감지

**기본 설정**:
- 소스: 자동 감지
- 타겟: 한국어

#### 3.2.2 텍스트 길이 지원

| 유형 | 예시 | 처리 방식 |
|------|------|-----------|
| **단어** | "productivity", "bug" | 전문 용어 사전 + 문맥 기반 다의어 처리 |
| **짧은 문장** | "Let me know if you need help." | 자연스러운 구어체/문어체 변환 |
| **문단** | 이메일, 보고서 본문 | 문맥 유지 + 전문 용어 일관성 |
| **긴 글** | 블로그 게시물, 논문 초록 | 단락별 처리 + 전체 일관성 유지 |

**제한사항**:
- 최대 길이: 5,000자 (AI API 토큰 제한 고려)
- 초과 시: 앞 5,000자만 번역 + 경고 메시지

---

## 4. 사용자 인터페이스

### 4.1 팝업 UI 구조 (v2.0)

#### Option 1: 탭 방식 (권장) ⭐

```
┌─────────────────────────────────────────────────┐
│  정중한 문장 도우미 & 번역기               [⚙️]  │
├─────────────────────────────────────────────────┤
│  [📝 정중한 문장]  [🌐 번역]                     │  ← 탭 전환
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 클립보드 텍스트 또는 직접 입력...        │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                     150자       │
│                                                 │
│  [📋 클립보드 읽기]  [🔄 변환/번역]            │
│                                                 │
│  ── 번역 설정 ────────────────────────────────  │
│  타겟 언어: [🇰🇷 한국어 ▼]                      │
│  전문가 모드: [💼 Technology Expert ▼]          │
│                                                 │
│  ── 결과 ─────────────────────────────────────  │
│  ┌───────────────────────────────────────────┐  │
│  │ [🇺🇸 English]                             │  │
│  │ 번역된 텍스트가 여기 표시됩니다...         │  │
│  │                                  [📋 복사] │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  [대체 번역 보기]  ← 2개 추가 번역 제공        │
│                                                 │
└─────────────────────────────────────────────────┘

크기: 420px × 650px
```

**탭 전환 동작**:
- `[📝 정중한 문장]` 탭: 기존 3가지 톤 UI 표시
- `[🌐 번역]` 탭: 번역 UI 표시
- 마지막 사용한 탭 기억

#### Option 2: 모드 선택 방식

```
┌─────────────────────────────────────────────────┐
│  비즈니스 커뮤니케이션 어시스턴트        [⚙️]  │
├─────────────────────────────────────────────────┤
│  모드 선택:  ⚪ 정중한 문장  ⚫ 번역              │
├─────────────────────────────────────────────────┤
│  [입력 영역]                                    │
│  [설정 영역]                                    │
│  [결과 영역]                                    │
└─────────────────────────────────────────────────┘
```

#### Option 3: 통합 방식

```
┌─────────────────────────────────────────────────┐
│  [입력 영역 - 공통]                             │
├─────────────────────────────────────────────────┤
│  작업 선택:                                     │
│  [📝 정중한 문장으로 변환]  [🌐 번역하기]       │
├─────────────────────────────────────────────────┤
│  [조건부 설정 영역]                             │
│  [결과 영역]                                    │
└─────────────────────────────────────────────────┘
```

### 4.2 번역 모드 UI 상세

#### 4.2.1 입력 영역

```
┌─────────────────────────────────────────────────┐
│  원문                                           │
│  ┌───────────────────────────────────────────┐  │
│  │ Hello, I found a critical bug in the     │  │
│  │ production environment.                   │  │
│  └───────────────────────────────────────────┘  │
│  [🇺🇸 English 감지됨]              45/5000자   │
│                                                 │
│  [📋 클립보드 읽기]  [🔄 번역]                  │
└─────────────────────────────────────────────────┘
```

#### 4.2.2 번역 설정 영역

```
┌─────────────────────────────────────────────────┐
│  타겟 언어                                      │
│  ┌───────────────────────────────────────────┐  │
│  │ 🇰🇷 한국어                            ▼  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  전문가 모드                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ 💼 Technology Expert              ▼  │  │
│  └───────────────────────────────────────────┘  │
│  ℹ️ IT 및 기술 문서에 최적화된 번역             │
└─────────────────────────────────────────────────┘
```

#### 4.2.3 결과 영역

```
┌─────────────────────────────────────────────────┐
│  ✅ 번역 완료!                                   │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ [주 번역]                                 │  │
│  │ 🇰🇷 → 🇺🇸 Technology Expert              │  │
│  │                                           │  │
│  │ 안녕하세요, 프로덕션 환경에서              │  │
│  │ 크리티컬한 버그를 발견했습니다.            │  │
│  │                                           │  │
│  │                                [📋 복사]  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  [💡 대체 번역 2개 더 보기]                     │
│                                                 │
│  [펼치면]                                       │
│  ┌───────────────────────────────────────────┐  │
│  │ [대체 1] Plain English Expert             │  │
│  │ 안녕하세요, 실제 서비스 환경에서 심각한    │  │
│  │ 오류를 찾았습니다.              [📋 복사]  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ [대체 2] 일반 번역                        │  │
│  │ 안녕하세요, 프로덕션 환경에서 중대한 버그를│  │
│  │ 발견했습니다.                    [📋 복사] │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.3 정중한 문장 모드 UI (기존 유지)

```
┌─────────────────────────────────────────────────┐
│  [입력 영역 - 동일]                             │
│  [액션 바 - 동일]                               │
│                                                 │
│  ── 결과 ─────────────────────────────────────  │
│  ┌───────────────────────────────────────────┐  │
│  │ [비즈니스 이메일] 기본 선택                │  │
│  │ ...                                       │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ [사내 메신저]                             │  │
│  │ ...                                       │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ [캐주얼 채팅]                             │  │
│  │ ...                                       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 5. 단축키 시스템

### 5.1 단축키 정의

| OS | 정중한 문장 모드 | 번역 모드 |
|----|-----------------|-----------|
| **macOS** | `Cmd+Option+C` | `Cmd+Option+D` |
| **Windows** | `Ctrl+Alt+C` | `Ctrl+Alt+D` |
| **Linux** | `Ctrl+Alt+C` | `Ctrl+Alt+D` |

### 5.2 단축키 동작

**방식 1: Chrome Commands API (권장) ⭐**

```json
// manifest.json
{
  "commands": {
    "tone-conversion": {
      "suggested_key": {
        "default": "Ctrl+Alt+C",
        "mac": "Command+Alt+C"
      },
      "description": "정중한 문장으로 변환"
    },
    "translation": {
      "suggested_key": {
        "default": "Ctrl+Alt+D",
        "mac": "Command+Alt+D"
      },
      "description": "번역하기"
    }
  }
}
```

**동작 플로우**:
```
1. 사용자가 텍스트 복사 (Cmd+C)
   ↓
2. 단축키 입력
   - Cmd+Option+C: 정중한 문장 모드로 팝업 열기
   - Cmd+Option+D: 번역 모드로 팝업 열기
   ↓
3. 클립보드 텍스트 자동 읽기
   ↓
4. 해당 모드로 자동 처리
   ↓
5. 결과 표시 + 자동 복사 (설정 시)
```

**방식 2: 팝업 내 단축키**

팝업이 이미 열려있을 때:
- `Ctrl+1` 또는 `Cmd+1`: 정중한 문장 탭
- `Ctrl+2` 또는 `Cmd+2`: 번역 탭
- `Ctrl+Enter`: 현재 모드 실행

### 5.3 단축키 커스터마이징

사용자가 `chrome://extensions/shortcuts`에서 단축키 변경 가능.

설정 페이지에 안내 추가:
```
┌─────────────────────────────────────────────────┐
│  ⌨️ 단축키 설정                                  │
│                                                 │
│  정중한 문장: Cmd+Option+C                      │
│  번역: Cmd+Option+D                             │
│                                                 │
│  [단축키 변경하기 →]                            │
│  (Chrome 확장 프로그램 단축키 설정 페이지로 이동)│
└─────────────────────────────────────────────────┘
```

---

## 6. 번역 전문가 모드

### 6.1 전문가 모드 목록 (22개)

| 카테고리 | 전문가 모드 | 설명 | 사용 예시 |
|---------|------------|------|-----------|
| **일반** | Plain English Expert | 평이하고 이해하기 쉬운 영어 | 이메일, 일상 대화 |
| **일반** | Paraphrase Expert | 다른 표현으로 재작성 | 표절 방지, 재해석 |
| **일반** | Paragraph Summarizer | 문단 요약 | 긴 글 요약 |
| **기술** | Technology Expert | IT, 소프트웨어 개발 | GitHub, 기술 문서 |
| **기술** | GitHub Translation Enhancer | GitHub 특화 (Issue, PR) | GitHub 협업 |
| **기술** | Web3 Translation Expert | 블록체인, 암호화폐 | Web3 프로젝트 |
| **학술** | Academic Paper Expert | 학술 논문 | 연구 논문, 학회 |
| **비즈니스** | Financial Expert | 금융, 재무 | 재무 보고서, 투자 |
| **비즈니스** | Legal Expert | 법률, 계약서 | 계약서, 약관 |
| **비즈니스** | E-commerce Expert | 전자상거래 | 상품 설명, 리뷰 |
| **미디어** | Media Expert | 뉴스, 기사 | 언론 보도 |
| **미디어** | Music Expert | 음악, 가사 | 가사 번역 |
| **소셜** | Twitter Translation Enhancer | 트위터 특화 | 트윗, 스레드 |
| **소셜** | Reddit Translation Enhancer | Reddit 특화 | 서브레딧, 댓글 |
| **의료** | Medical Expert | 의학, 건강 | 의학 자료 |
| **게임** | Gaming Expert | 게임 | 게임 채팅, 공략 |
| **디자인** | Designer | 디자인, UI/UX | 디자인 문서 |
| **문학** | Fiction Translation Expert | 소설, 창작물 | 소설, 스토리 |
| **문학** | AO3 Translation Expert | 팬픽션 | AO3 작품 |
| **문학** | eBook Translation Expert | 전자책 | 전자책, 출판 |
| **기타** | Chinglish Mixing | 영어+중국어 혼용 | 중국계 커뮤니티 |
| **기타** | Translation Expert (일반) | 범용 번역 | 기본 번역 |

### 6.2 전문가 모드 프롬프트 예시

#### Technology Expert

```
# Role
당신은 IT 및 소프트웨어 개발 분야의 전문 번역가입니다.

# Context
- 대상: 개발자, 엔지니어, IT 전문가
- 분야: 프로그래밍, 시스템 아키텍처, DevOps, 클라우드
- 특징: 기술 용어는 원어 그대로 유지, 코드 관련 표현 정확히 전달

# Rules
1. 기술 용어는 번역하지 않고 원어 유지
   - 예: "bug", "deploy", "commit", "API" → 그대로 사용
2. 혼용 자연스럽게
   - ✅ "프로덕션 환경에 deploy 했습니다"
   - ❌ "제품 환경에 배포했습니다"
3. 약어 설명 생략
4. 전문성 유지

# Original Text
{{user_input}}

# Target Language
{{target_language}}
```

#### Plain English Expert

```
# Role
복잡한 문장을 쉽고 명확한 영어로 번역하는 전문가입니다.

# Rules
1. 짧고 간결한 문장 사용
2. 일상 어휘 선호 (전문 용어 최소화)
3. 능동태 우선
4. 불필요한 수식어 제거
5. 중학생도 이해할 수 있는 수준

# Original Text
{{user_input}}

# Target Language
{{target_language}}
```

#### GitHub Translation Enhancer

```
# Role
GitHub Issue, Pull Request, 코드 리뷰에 특화된 번역 전문가입니다.

# Context
- GitHub 협업 상황
- Issue 제목, 본문, 댓글
- PR 설명, 커밋 메시지
- 코드 리뷰 피드백

# Rules
1. Markdown 문법 유지
2. 코드 블록 (```) 내용 번역 안 함
3. GitHub 특수 문법 유지
   - [ ], [x], @mention, #issue
4. 기술 용어 원어 유지
5. 예의 바른 협업 톤

# Original Text
{{user_input}}

# Target Language
{{target_language}}
```

### 6.3 전문가 모드 UI 표시

**드롭다운 메뉴 구조**:
```
전문가 모드 선택  ▼
├─ 📌 자주 사용
│  ├─ 💼 Technology Expert
│  ├─ 📝 Plain English Expert
│  └─ 💬 Translation Expert (일반)
├─ 💻 기술
│  ├─ Technology Expert
│  ├─ GitHub Translation Enhancer
│  └─ Web3 Translation Expert
├─ 🎓 학술
│  └─ Academic Paper Expert
├─ 💼 비즈니스
│  ├─ Financial Expert
│  ├─ Legal Expert
│  └─ E-commerce Expert
├─ 📰 미디어
│  ├─ Media Expert
│  └─ Music Expert
├─ 💬 소셜
│  ├─ Twitter Translation Enhancer
│  └─ Reddit Translation Enhancer
├─ 🏥 의료
│  └─ Medical Expert
├─ 🎮 게임
│  └─ Gaming Expert
├─ 🎨 디자인
│  └─ Designer
├─ 📚 문학
│  ├─ Fiction Translation Expert
│  ├─ AO3 Translation Expert
│  └─ eBook Translation Expert
└─ 🌐 기타
   ├─ Paraphrase Expert
   ├─ Paragraph Summarizer
   └─ Chinglish Mixing
```

**최근 사용 + 즐겨찾기**:
- 최근 사용한 3개 모드 상단 고정
- ⭐ 아이콘으로 즐겨찾기 추가/제거

---

## 7. 언어 감지 및 처리

### 7.1 언어 자동 감지

**방법**: AI에게 언어 감지 요청

```typescript
// 첫 번째 API 호출: 언어 감지
const detectedLanguage = await detectLanguage(inputText)

// 두 번째 API 호출: 번역
const translation = await translate(inputText, detectedLanguage, targetLanguage, expertMode)
```

**최적화**: 한 번의 API 호출로 처리

```typescript
// 프롬프트에 언어 감지 + 번역 통합
const prompt = `
Detect the language of the following text and translate it to ${targetLanguage}.

Original Text:
${inputText}

Output Format (JSON):
{
  "detected_language": "en",
  "detected_language_name": "English",
  "translation": "..."
}
`
```

### 7.2 언어 감지 UI 표시

```
┌─────────────────────────────────────────────────┐
│  원문                                           │
│  ┌───────────────────────────────────────────┐  │
│  │ Hello, world!                             │  │
│  └───────────────────────────────────────────┘  │
│  [🇺🇸 영어 감지됨] ← 자동 감지 결과            │
│                                                 │
│  타겟 언어: [🇰🇷 한국어 ▼]                      │
│  자동 변환: 영어 → 한국어 ✅                    │
└─────────────────────────────────────────────────┘
```

### 7.3 다의어 처리 (단어 번역)

**문제**: 하나의 단어가 여러 의미를 가짐

**해결책**: 전문가 모드별 문맥 제공

예시: "bug" 번역
- Technology Expert: "버그" (소프트웨어 오류)
- General: "벌레" 또는 "버그" (문맥에 따라)
- Gaming Expert: "버그" (게임 오류)

**UI 표시**:
```
┌─────────────────────────────────────────────────┐
│  원문: bug                                      │
│  전문가 모드: 💼 Technology Expert               │
│                                                 │
│  주 번역: 버그                                  │
│  설명: 소프트웨어 오류를 의미함                  │
│                                                 │
│  💡 다른 의미:                                  │
│  • 벌레 (일반 의미)                             │
│  • 도청 장치 (보안 분야)                         │
└─────────────────────────────────────────────────┘
```

### 7.4 언어 쌍 특수 처리

**한국어 ↔ 영어**:
- 한국어 존댓말/반말 구분 유지
- 영어의 자연스러운 어순

**영어 ↔ 일본어**:
- 존경어 처리
- 가타카나 외래어 처리

**한국어 ↔ 중국어**:
- 한자 대응 (번체/간체)
- 문화적 뉘앙스

---

## 8. 설정 관리

### 8.1 번역 설정 데이터 스키마

```typescript
interface TranslationSettings {
  // 기본 설정
  defaultTargetLanguage: 'ko' | 'en' | 'ja' | 'zh-CN';
  defaultExpertMode: string;  // 'technology', 'plain-english', etc.
  
  // 자동화 설정
  autoDetectLanguage: boolean;  // 기본: true
  autoCopyTranslation: boolean;  // 기본: true
  showAlternativeTranslations: boolean;  // 기본: true
  numberOfAlternatives: number;  // 1-3, 기본: 2
  
  // 즐겨찾기
  favoriteExpertModes: string[];  // 최대 5개
  recentExpertModes: string[];    // 최근 3개 (자동)
  
  // 고급 설정
  maxTextLength: number;  // 기본: 5000
  preserveFormatting: boolean;  // Markdown, 줄바꿈 유지
}
```

### 8.2 설정 UI

**Settings 페이지 - 새 섹션 추가**:

```
┌─────────────────────────────────────────────────┐
│  설정                                           │
├─────────────────────────────────────────────────┤
│  [AI 제공업체 설정] (기존)                      │
│  [정중한 문장 설정] (기존)                      │
│  [번역 설정] (신규) ⭐                          │
└─────────────────────────────────────────────────┘
```

**번역 설정 상세**:

```
┌─────────────────────────────────────────────────┐
│  🌐 번역 설정                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  기본 타겟 언어                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 🇰🇷 한국어                            ▼  │  │
│  └───────────────────────────────────────────┘  │
│  ℹ️ 자동 감지된 언어를 이 언어로 번역합니다      │
│                                                 │
│  기본 전문가 모드                               │
│  ┌───────────────────────────────────────────┐  │
│  │ 💼 Technology Expert              ▼  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ── 자동화 ────────────────────────────────────  │
│  ☑️ 언어 자동 감지                               │
│  ☑️ 번역 결과 자동 복사                          │
│  ☑️ 대체 번역 표시 (2개)                        │
│                                                 │
│  ── 즐겨찾기 전문가 모드 ──────────────────────  │
│  ⭐ Technology Expert                            │
│  ⭐ GitHub Translation Enhancer                 │
│  ⭐ Plain English Expert                        │
│  [+ 추가]                                       │
│                                                 │
│  ── 고급 설정 ─────────────────────────────────  │
│  최대 텍스트 길이: [5000] 자                    │
│  ☑️ 서식 유지 (Markdown, 줄바꿈)                 │
│                                                 │
│  [저장]  [초기화]                               │
└─────────────────────────────────────────────────┘
```

### 8.3 Storage 스키마 업데이트

```typescript
// 기존 AppStorage 확장
interface AppStorage {
  // 기존 필드들...
  apiKeys: { ... };
  dailyUsage: { ... };
  settings: {
    // 기존 정중한 문장 설정
    selectedProvider: AIProvider;
    autoCopyEnabled: boolean;
    autoCopyTone: 'formal' | 'general' | 'friendly';
    
    // 신규 번역 설정
    translation: TranslationSettings;
  };
}
```

---

## 9. 기술 요구사항

### 9.1 manifest.json 업데이트

```json
{
  "manifest_version": 3,
  "name": "비즈니스 커뮤니케이션 어시스턴트",
  "version": "2.0.0",
  "description": "정중한 문장 변환 + AI 전문 번역",
  
  "permissions": [
    "storage",
    "clipboardRead",
    "clipboardWrite"
  ],
  
  "commands": {
    "tone-conversion": {
      "suggested_key": {
        "default": "Ctrl+Alt+C",
        "mac": "Command+Alt+C"
      },
      "description": "정중한 문장으로 변환"
    },
    "translation": {
      "suggested_key": {
        "default": "Ctrl+Alt+D",
        "mac": "Command+Alt+D"
      },
      "description": "번역하기"
    }
  },
  
  "host_permissions": [
    "https://generativelanguage.googleapis.com/*",
    "https://api.openai.com/*",
    "https://api.anthropic.com/*"
  ]
}
```

### 9.2 API 프롬프트 구조

```typescript
interface TranslationRequest {
  text: string;
  sourceLanguage?: string;  // 비어있으면 자동 감지
  targetLanguage: 'ko' | 'en' | 'ja' | 'zh-CN';
  expertMode: string;
  numberOfAlternatives?: number;  // 1-3
}

interface TranslationResponse {
  detectedLanguage: string;
  detectedLanguageName: string;
  mainTranslation: string;
  alternatives?: string[];
  expertMode: string;
}
```

### 9.3 새 유틸리티 함수

```typescript
// src/utils/translation.ts (신규)

export async function translateText(
  text: string,
  targetLanguage: string,
  expertMode: string,
  provider: AIProvider,
  apiKey: string
): Promise<TranslationResponse>

export function detectLanguage(text: string): string

export function getExpertModePrompt(
  mode: string,
  sourceText: string,
  targetLanguage: string
): string

export const EXPERT_MODES = {
  'technology': { name: 'Technology Expert', icon: '💼', ... },
  'plain-english': { name: 'Plain English Expert', icon: '📝', ... },
  // ... 22개 전체
}
```

### 9.4 컴포넌트 구조

```
src/
├── popup/
│   ├── App.tsx                    # 탭 라우팅 추가
│   ├── components/
│   │   ├── ToneConversion/        # 기존 정중한 문장
│   │   │   ├── ToneTab.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── ActionBar.tsx
│   │   └── Translation/           # 신규 번역
│   │       ├── TranslationTab.tsx
│   │       ├── TranslationInput.tsx
│   │       ├── LanguageSelector.tsx
│   │       ├── ExpertModeSelector.tsx
│   │       ├── TranslationResult.tsx
│   │       └── AlternativeTranslations.tsx
├── options/
│   ├── Settings.tsx               # 번역 설정 섹션 추가
│   └── components/
│       └── TranslationSettings.tsx
├── utils/
│   ├── api.ts                     # 기존 (확장 필요)
│   ├── translation.ts             # 신규
│   ├── storage.ts                 # 스키마 확장
│   └── ...
└── types/
    └── index.ts                   # Translation 타입 추가
```

---

## 10. 사용자 플로우

### 10.1 번역 플로우 - 단축키 사용

```
1. 웹페이지에서 영어 문장 복사
   "Hello, I found a critical bug in the production environment."
   ↓
2. 단축키 입력: Cmd+Option+D
   ↓
3. 팝업 자동 열림 (번역 탭 활성화)
   ↓
4. 클립보드 텍스트 자동 입력
   [🇺🇸 English 감지됨]
   ↓
5. 기본 설정으로 자동 번역
   타겟: 한국어
   전문가 모드: Technology Expert
   ↓
6. API 호출 (1-2초)
   ↓
7. 결과 표시
   주 번역: "안녕하세요, 프로덕션 환경에서 크리티컬한 버그를 발견했습니다."
   대체 1: Plain English Expert 버전
   대체 2: 일반 번역 버전
   ↓
8. 자동 복사 (설정 시)
   주 번역이 클립보드에 복사됨
   ↓
9. 다른 앱으로 이동하여 Cmd+V 붙여넣기
```

### 10.2 번역 플로우 - 수동 입력

```
1. 팝업 열기 (아이콘 클릭)
   ↓
2. [🌐 번역] 탭 클릭
   ↓
3. 텍스트 직접 입력 또는 [📋 클립보드 읽기]
   ↓
4. 설정 조정 (선택 사항)
   - 타겟 언어 변경
   - 전문가 모드 변경
   ↓
5. [🔄 번역] 버튼 클릭
   ↓
6. 결과 확인 및 복사
```

### 10.3 전문가 모드 변경 플로우

```
1. 번역 결과 보고 있음
   ↓
2. "음, 이 번역은 너무 기술적이네..."
   ↓
3. 전문가 모드 변경
   Technology Expert → Plain English Expert
   ↓
4. [🔄 다시 번역] 버튼 클릭
   (또는 자동 재번역)
   ↓
5. 새 번역 결과 표시
```

### 10.4 단어 번역 플로우

```
1. "productivity" 단어 복사
   ↓
2. Cmd+Option+D
   ↓
3. 번역 팝업 열림
   [🇺🇸 English 감지됨] - 단어
   ↓
4. 전문가 모드: Technology Expert
   ↓
5. 결과 표시
   주 번역: "생산성"
   설명: "업무 효율성, 산출량을 의미"
   
   💡 다른 의미:
   • 생산력 (경제 분야)
   • 프로덕티비티 (그대로 사용)
   ↓
6. 원하는 번역 선택하여 복사
```

---

## 11. 성공 지표

### 11.1 핵심 지표 (KPI)

| 구분 | 지표 | 현재 (v1.0) | 목표 (v2.0, 3개월 후) |
|------|------|-------------|------------------------|
| **사용자** | DAU | 1,000명 | 3,000명 (+200%) |
| **사용자** | 주간 활성 사용자 (WAU) | 5,000명 | 15,000명 |
| **사용자** | 평균 세션 시간 | 30초 | 60초 (+100%) |
| **기능** | 번역 기능 사용률 | 0% | 70% |
| **기능** | 전문가 모드 사용 분포 | - | 상위 5개 모드가 80% |
| **품질** | 번역 만족도 (설문) | - | 4.5/5.0 |
| **품질** | 재번역률 | - | < 20% |
| **성능** | 번역 API 응답 시간 | - | < 2초 |
| **비즈니스** | Chrome 웹스토어 평점 | 4.5/5.0 | 4.7/5.0 |

### 11.2 추적 이벤트

```typescript
// Analytics Events

// 번역 사용
track('translation_used', {
  source_language: 'en',
  target_language: 'ko',
  expert_mode: 'technology',
  text_length: 150,
  trigger: 'shortcut' | 'button'
})

// 전문가 모드 변경
track('expert_mode_changed', {
  from_mode: 'technology',
  to_mode: 'plain-english',
  reason: 'manual_change' | 're_translate'
})

// 대체 번역 사용
track('alternative_translation_copied', {
  alternative_index: 1,
  expert_mode: 'plain-english'
})

// 설정 변경
track('translation_settings_updated', {
  default_target_language: 'ko',
  default_expert_mode: 'technology'
})
```

### 11.3 A/B 테스트 계획

**테스트 1: UI 레이아웃**
- A: 탭 방식 (권장)
- B: 모드 선택 방식
- 측정: 사용 편의성, 모드 전환 빈도

**테스트 2: 대체 번역 개수**
- A: 1개
- B: 2개 (권장)
- C: 3개
- 측정: 대체 번역 사용률, 만족도

**테스트 3: 자동 번역 vs 수동 번역**
- A: 단축키 누르면 즉시 자동 번역
- B: 팝업 열고 [번역] 버튼 클릭 필요
- 측정: 사용 빈도, 만족도

---

## 12. 개발 우선순위 및 일정

### 12.1 Phase 1: MVP (4주)

**Week 1-2: 핵심 번역 기능**
- [ ] 번역 API 통합 (언어 감지 + 번역)
- [ ] 5개 핵심 전문가 모드 구현
  - Technology Expert
  - Plain English Expert
  - Translation Expert (일반)
  - GitHub Translation Enhancer
  - Academic Paper Expert
- [ ] 번역 UI (탭 방식)
- [ ] Storage 스키마 업데이트

**Week 3: 단축키 + 통합**
- [ ] Chrome Commands API 통합
- [ ] 단축키로 모드별 팝업 열기
- [ ] 기존 정중한 문장 기능과 통합
- [ ] 설정 페이지 업데이트

**Week 4: 테스트 + 배포**
- [ ] 전체 기능 테스트
- [ ] 성능 최적화
- [ ] 문서 업데이트
- [ ] Chrome 웹스토어 제출

### 12.2 Phase 2: 고급 기능 (2주)

**Week 5-6**
- [ ] 나머지 17개 전문가 모드 추가
- [ ] 대체 번역 기능
- [ ] 즐겨찾기 전문가 모드
- [ ] 번역 히스토리
- [ ] 통계 대시보드

### 12.3 Phase 3: 최적화 (진행 중)

- [ ] A/B 테스트 실행
- [ ] 사용자 피드백 반영
- [ ] 성능 튜닝
- [ ] 추가 언어 지원 (필요 시)

---

## 부록: 디자인 요청 메타 프롬프트

다음 섹션에 별도 문서로 작성됩니다.

---

**문서 작성자**: Product Manager  
**검토자**: CTO, Lead Developer, UX Designer  
**최종 승인**: CEO  
**다음 단계**: 디자인 메타 프롬프트 작성 → Gemini에게 UI 디자인 요청

