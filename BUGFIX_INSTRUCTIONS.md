# 🐛 브라우저 확장 프로그램 버그 수정 가이드

## 📋 개요

BCA (Business Communication Assistant) 크롬 확장 프로그램의 3가지 주요 버그를 수정합니다:

1. **브라우저 UI 변형 문제** - YouTube에서 영상 목록이 세로로 길게 표시되고 채널명이 잘리는 현상
2. **불필요한 API 호출 문제** - 번역 버튼 클릭 시 언어 선택 없이 즉시 API 호출되어 비용 낭비
3. **UI/UX 개선** - 에러 메시지 처리, 복사 실패 알림, 오버플로우 수정

---

## 🎯 Phase 1: 브라우저 UI 변형 문제 수정 (최우선)

### 1.1 Toast 알림 z-index 및 오버플로우 수정

**파일:** `src/content/toast.ts`

**위치:** 16-35번째 줄의 `Object.assign(container.style, { ... })` 부분

**변경 사항:**
```typescript
Object.assign(container.style, {
  position: 'fixed',
  bottom: '32px',
  right: '32px',
  maxWidth: '400px',           // 추가
  minWidth: '200px',           // 추가
  padding: '14px 24px',
  borderRadius: '14px',
  backgroundColor: type === 'error' ? '#ef4444' : '#18181b',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  wordWrap: 'break-word',      // 추가
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  zIndex: '99999999',          // 변경: 2147483647 → 99999999
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: '0',
  transform: 'translateY(20px)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
});
```

**이유:**
- 최대 정수값 z-index는 렌더링 버그 유발 가능
- 긴 메시지가 화면을 벗어나는 문제 해결

---

### 1.2 번역 블록 스타일 수정

**파일:** `src/content/replacer.ts`

**위치:** 94-112번째 줄의 번역 블록 스타일 설정 부분

**변경 내용:**
```typescript
const container = document.createElement('div');
container.className = 'bca-translation-block';
// 인라인 스타일로 기본 디자인 적용 (global.css 영향 최소화 및 확실한 구분)
container.style.display = 'inline-block';        // 변경: 'block' → 'inline-block'
container.style.maxWidth = '100%';               // 추가
container.style.verticalAlign = 'top';           // 추가
container.style.boxSizing = 'border-box';        // 추가
container.style.color = '#2563eb'; // blue-600
container.style.fontSize = '0.95em';
container.style.marginTop = '8px';
container.style.marginBottom = '8px';
container.style.padding = '8px 12px';
container.style.borderLeft = '3px solid #3b82f6';
container.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
container.style.whiteSpace = 'pre-wrap';
container.style.borderRadius = '4px';
container.style.lineHeight = '1.6';
container.style.fontFamily = 'sans-serif';
container.style.textAlign = 'left';
```

**이유:**
- `display: block`이 YouTube의 flex/grid 레이아웃을 깨뜨림
- `inline-block`으로 변경하여 인라인/블록 컨텍스트 모두에서 정상 작동

---

### 1.3 Tailwind CSS 스코핑 (가장 중요)

**파일:** `src/styles/global.css`

**변경 1 - 상단 부분 (1-12번째 줄):**

**기존:**
```css
/* @tailwind base; 제거 - 호스트 페이지(Gmail 등)의 스타일 오염 방지 */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
@tailwind components;
@tailwind utilities;

/* CSS Variables - shadcn/ui 호환 (Zinc theme) */
:root, .bca-ui-root {
```

**변경 후:**
```css
/* @tailwind base; 제거 - 호스트 페이지(Gmail 등)의 스타일 오염 방지 */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

/* Scope Tailwind CSS to BCA extension only using CSS layers */
@layer bca-extension {
  @tailwind components;
  @tailwind utilities;
}

/* CSS Variables - shadcn/ui 호환 (Zinc theme) */
@layer bca-extension {
  :root, .bca-ui-root {
```

**변경 2 - 중간 부분 (75-81번째 줄 부근):**

**기존:**
```css
.bca-ui-root .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground)/0.5);
}


/* 로딩 스피너 애니메이션 */
```

**변경 후:**
```css
.bca-ui-root .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground)/0.5);
}
}

/* Content script styles - MUST stay outside layer for host page compatibility */
/* 로딩 스피너 애니메이션 */
```

**이유:**
- Tailwind CSS가 전역으로 주입되어 YouTube 등 다른 사이트의 스타일과 충돌
- CSS Layer로 스코핑하여 확장 프로그램 내부에만 적용
- 콘텐츠 스크립트 스타일(스피너 등)은 레이어 밖에 유지하여 호스트 페이지에서 작동

---

## 🎯 Phase 2: 번역 API 호출 개선

### 2.1 소스 언어 상태 추가

**파일:** `src/popup/App.tsx`

**위치:** 21-24번째 줄 (상태 선언 부분)

**변경:**
```typescript
const [activeTab, setActiveTab] = useState<'tone' | 'translation'>('tone')
const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('ko')
const [sourceLanguage, setSourceLanguage] = useState<'auto' | TargetLanguage>('auto')  // 추가
const [message, setMessage] = useState('')
```

---

### 2.2 버튼 동작 분리 (탭 전환만 수행)

**파일:** `src/popup/App.tsx`

**위치:** 231-256번째 줄

**기존:**
```typescript
<button
  onClick={() => { setActiveTab('tone'); handleProcess(inputText, 'tone'); }}
  disabled={loadingState === 'loading'}
  className={/* ... */}
>
  <Sparkles className="w-4 h-4" />
  톤 변환
</button>
<button
  onClick={() => { setActiveTab('translation'); handleProcess(inputText, 'translation'); }}
  disabled={loadingState === 'loading'}
  className={/* ... */}
>
  <Languages className="w-4 h-4" />
  전문 번역
</button>
```

**변경 후:**
```typescript
<button
  onClick={() => { setActiveTab('tone'); updateLastUsedTab('tone'); }}
  disabled={loadingState === 'loading'}
  className={/* ... */}
>
  <Sparkles className="w-4 h-4" />
  톤 변환
</button>
<button
  onClick={() => { setActiveTab('translation'); updateLastUsedTab('translation'); }}
  disabled={loadingState === 'loading'}
  className={/* ... */}
>
  <Languages className="w-4 h-4" />
  전문 번역
</button>
```

**이유:** 버튼 클릭 시 즉시 API 호출하지 않고 탭만 전환

---

### 2.3 프로세스 버튼 추가

**파일:** `src/popup/App.tsx`

**위치:** 257-325번째 줄 (탭 버튼 아래)

**기존:**
```typescript
{activeTab === 'translation' && (
  <div className="pt-2">
    <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
      <SelectItem value="ko">한국어로 번역</SelectItem>
      <SelectItem value="en">영어로 번역</SelectItem>
      <SelectItem value="ja">일본어로 번역</SelectItem>
      <SelectItem value="zh-CN">중국어로 번역</SelectItem>
    </Select>
  </div>
)}
```

**변경 후:**
```typescript
{/* Tone process button */}
{activeTab === 'tone' && (
  <div className="pt-2">
    <button
      onClick={() => handleProcess(inputText, 'tone')}
      disabled={loadingState === 'loading'}
      className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
    >
      {loadingState === 'loading' ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          처리 중...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          톤 변환 실행
        </>
      )}
    </button>
  </div>
)}

{/* Translation language selection + process button */}
{activeTab === 'translation' && (
  <div className="pt-2 space-y-2">
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
        원본 언어
      </label>
      <Select value={sourceLanguage} onValueChange={(v) => setSourceLanguage(v as 'auto' | TargetLanguage)}>
        <SelectItem value="auto">자동 감지</SelectItem>
        <SelectItem value="ko">한국어</SelectItem>
        <SelectItem value="en">영어</SelectItem>
        <SelectItem value="ja">일본어</SelectItem>
        <SelectItem value="zh-CN">중국어</SelectItem>
      </Select>
    </div>
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
        번역할 언어
      </label>
      <Select value={targetLanguage} onValueChange={(v) => setTargetLanguage(v as TargetLanguage)}>
        <SelectItem value="ko">한국어</SelectItem>
        <SelectItem value="en">영어</SelectItem>
        <SelectItem value="ja">일본어</SelectItem>
        <SelectItem value="zh-CN">중국어</SelectItem>
      </Select>
    </div>
    <button
      onClick={() => handleProcess(inputText, 'translation')}
      disabled={loadingState === 'loading'}
      className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
    >
      {loadingState === 'loading' ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          번역 중...
        </>
      ) : (
        <>
          <Languages className="w-3.5 h-3.5" />
          번역 시작
        </>
      )}
    </button>
  </div>
)}
```

**이유:**
- 사용자가 언어 방향을 선택한 후 명시적으로 "번역 시작" 버튼을 눌러야 API 호출
- 불필요한 API 비용 낭비 방지

---

## 🎯 Phase 3: UI/UX 개선

### 3.1 에러 메시지 지속성 개선

**파일:** `src/popup/App.tsx`

**위치 1:** 2번째 줄 - import 수정

**기존:**
```typescript
import { AlertCircle, Sparkles, Command, ShieldCheck, Languages, MessageSquare, Loader2, Settings } from 'lucide-react'
```

**변경 후:**
```typescript
import { AlertCircle, Sparkles, Command, ShieldCheck, Languages, MessageSquare, Loader2, Settings, X } from 'lucide-react'
```

---

**위치 2:** 155-172번째 줄 - showStatusMessage 함수 수정

**기존:**
```typescript
const showStatusMessage = (msg: string, type: 'success' | 'error') => {
  setMessage(msg); setMessageType(type)
  setTimeout(() => { setMessage(''); setMessageType('') }, 2000)
}
```

**변경 후:**
```typescript
const showStatusMessage = (msg: string, type: 'success' | 'error') => {
  setMessage(msg);
  setMessageType(type)

  // Only auto-dismiss success messages
  if (type === 'success') {
    setTimeout(() => {
      setMessage('');
      setMessageType('')
    }, 2000)
  }
  // Error messages stay until user dismisses
}

const dismissMessage = () => {
  setMessage('');
  setMessageType('');
}
```

---

**위치 3:** 196-209번째 줄 - 메시지 표시 UI 수정

**기존:**
```typescript
{message && (
  <div className={`px-3 py-1.5 rounded-full text-[12px] font-bold animate-in fade-in slide-in-from-right-2 border flex items-center gap-2 ${
    messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
  }`}>
    {messageType === 'success' ? <Sparkles className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
    {message}
  </div>
)}
```

**변경 후:**
```typescript
{message && (
  <div className={`px-3 py-1.5 rounded-full text-[12px] font-bold animate-in fade-in slide-in-from-right-2 border flex items-center gap-2 max-w-[300px] ${
    messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
  }`}>
    {messageType === 'success' ? <Sparkles className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
    <span className="truncate">{message}</span>
    {messageType === 'error' && (
      <button onClick={dismissMessage} className="ml-1 hover:opacity-70 shrink-0">
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
)}
```

**이유:**
- 성공 메시지는 2초 후 자동 사라짐
- 에러 메시지는 사용자가 X 버튼을 눌러 직접 닫을 때까지 유지
- 긴 메시지 오버플로우 방지

---

### 3.2 복사 실패 알림 추가

**파일 1:** `src/types/ui.ts`

**위치:** 19-27번째 줄

**기존:**
```typescript
export interface ResultCardProps {
  tone: ToneType;
  text?: string;
  onCopy: (text: string) => Promise<void> | void;
  isDefaultSelected?: boolean;
  onConvert?: (tone: ToneType) => void;
  isLoading?: boolean;
}
```

**변경 후:**
```typescript
export interface ResultCardProps {
  tone: ToneType;
  text?: string;
  onCopy: (text: string) => Promise<void> | void;
  onCopyError?: (message: string) => void;  // 추가
  isDefaultSelected?: boolean;
  onConvert?: (tone: ToneType) => void;
  isLoading?: boolean;
}
```

---

**파일 2:** `src/popup/components/ResultCard.tsx`

**위치:** 13-35번째 줄

**기존:**
```typescript
const ResultCard: React.FC<ResultCardProps> = ({
  tone,
  text,
  onCopy,
  isDefaultSelected = false,
  onConvert,
  isLoading = false
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const label = TONE_LABELS[tone]

  const handleCopy = async () => {
    if (!text) return;
    try {
      await onCopy(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }
```

**변경 후:**
```typescript
const ResultCard: React.FC<ResultCardProps> = ({
  tone,
  text,
  onCopy,
  onCopyError,  // 추가
  isDefaultSelected = false,
  onConvert,
  isLoading = false
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const label = TONE_LABELS[tone]

  const handleCopy = async () => {
    if (!text) return;
    try {
      await onCopy(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      onCopyError?.('클립보드 복사에 실패했습니다.')  // 추가
    }
  }
```

---

**파일 3:** `src/popup/App.tsx`

**위치:** 372-402번째 줄 (결과 카드 렌더링 부분)

**기존:**
```typescript
<ResultCard
  tone="formal"
  text={results.formal}
  onCopy={writeClipboard}
  isDefaultSelected={settings?.autoCopyTone === 'formal'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['formal']}
/>
<ResultCard
  tone="general"
  text={results.general}
  onCopy={writeClipboard}
  isDefaultSelected={settings?.autoCopyTone === 'general'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['general']}
/>
<ResultCard
  tone="friendly"
  text={results.friendly}
  onCopy={writeClipboard}
  isDefaultSelected={settings?.autoCopyTone === 'friendly'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['friendly']}
/>
```

**변경 후:**
```typescript
<ResultCard
  tone="formal"
  text={results.formal}
  onCopy={writeClipboard}
  onCopyError={(msg) => showStatusMessage(msg, 'error')}  // 추가
  isDefaultSelected={settings?.autoCopyTone === 'formal'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['formal']}
/>
<ResultCard
  tone="general"
  text={results.general}
  onCopy={writeClipboard}
  onCopyError={(msg) => showStatusMessage(msg, 'error')}  // 추가
  isDefaultSelected={settings?.autoCopyTone === 'general'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['general']}
/>
<ResultCard
  tone="friendly"
  text={results.friendly}
  onCopy={writeClipboard}
  onCopyError={(msg) => showStatusMessage(msg, 'error')}  // 추가
  isDefaultSelected={settings?.autoCopyTone === 'friendly'}
  onConvert={handleSingleToneConversion}
  isLoading={convertingTones['friendly']}
/>
```

**이유:** 클립보드 복사 실패 시 사용자에게 알림 표시

---

## 🔨 빌드 및 테스트

### 빌드 명령어

```bash
cd /Users/sijin/Downloads/07.\ Cursor/business-message
npm run build
```

빌드가 성공하면 다음과 같은 출력이 표시됩니다:
```
✓ built in 2.28s
```

---

## ✅ 테스트 체크리스트

### 1. YouTube 레이아웃 테스트
- [ ] YouTube 홈페이지에서 영상 썸네일이 정상적으로 표시되는지 확인
- [ ] 영상 목록이 세로로 길게 늘어나지 않는지 확인
- [ ] 채널명이 잘리지 않고 정상 표시되는지 확인
- [ ] 영상 제목이나 설명을 번역해도 레이아웃이 깨지지 않는지 확인

### 2. 번역 플로우 테스트
- [ ] "전문 번역" 버튼 클릭 → 탭만 전환되고 API 호출 안 됨
- [ ] 원본 언어 선택 드롭다운 표시 확인 (자동 감지, 한국어, 영어, 일본어, 중국어)
- [ ] 번역할 언어 선택 드롭다운 표시 확인
- [ ] "번역 시작" 버튼을 눌러야만 API 호출 시작
- [ ] 로딩 중에는 "번역 중..." 표시 확인
- [ ] 한국어 → 영어 번역 정상 작동 확인
- [ ] 영어 → 한국어 번역 정상 작동 확인

### 3. 톤 변환 플로우 테스트
- [ ] "톤 변환" 버튼 클릭 → 탭만 전환되고 API 호출 안 됨
- [ ] "톤 변환 실행" 버튼 표시 확인
- [ ] "톤 변환 실행" 버튼 클릭 시 API 호출 시작
- [ ] 3가지 톤(비즈니스, 사내, 캐주얼) 모두 정상 표시 확인

### 4. 에러 처리 테스트
- [ ] 성공 메시지는 2초 후 자동으로 사라지는지 확인
- [ ] 에러 메시지는 X 버튼을 누를 때까지 유지되는지 확인
- [ ] 에러 메시지의 X 버튼 클릭 시 메시지가 사라지는지 확인
- [ ] 복사 실패 시 에러 알림이 표시되는지 확인 (네트워크 차단 등으로 테스트)

### 5. 다른 웹사이트 테스트
- [ ] Gmail에서 스타일 충돌이 없는지 확인
- [ ] LinkedIn에서 레이아웃이 정상인지 확인
- [ ] Twitter/X에서 스타일이 깨지지 않는지 확인

### 6. Toast 알림 테스트
- [ ] Toast 알림이 화면 우측 하단에 정상 표시되는지 확인
- [ ] 긴 메시지가 400px를 넘지 않고 줄바꿈되는지 확인
- [ ] Toast 알림이 다른 페이지 요소를 가리지 않는지 확인

---

## 📊 기대 효과

1. **YouTube 레이아웃 정상화** - CSS 충돌 제거로 영상 목록 및 채널명 정상 표시
2. **API 비용 절감** - 불필요한 번역 호출 방지 (사용자가 언어 선택 후 명시적으로 실행)
3. **UX 개선** - 에러 메시지 가독성 향상, 복사 실패 알림 추가
4. **안정성 향상** - z-index 및 오버플로우 이슈 해결

---

## 🚨 주의사항

1. **백업 필수**: 수정 전 반드시 현재 버전을 백업하세요
2. **순차 진행**: Phase 1 → 2 → 3 순서대로 진행하고 각 단계마다 빌드/테스트 권장
3. **스타일 충돌**: CSS Layer 스코핑이 제대로 적용되었는지 반드시 확인
4. **API 키**: 테스트 시 실제 API 키가 설정되어 있어야 번역 기능 테스트 가능

---

## 📝 변경된 파일 목록

1. `src/content/toast.ts` - Toast z-index 및 오버플로우 수정
2. `src/content/replacer.ts` - 번역 블록 display 스타일 수정
3. `src/styles/global.css` - Tailwind CSS Layer 스코핑
4. `src/popup/App.tsx` - 번역 플로우, 에러 처리, UI 개선
5. `src/popup/components/ResultCard.tsx` - 복사 에러 핸들링
6. `src/types/ui.ts` - ResultCardProps 인터페이스 확장

---

## 🔄 롤백 방법

문제 발생 시 git을 사용하여 이전 버전으로 복구:

```bash
# 특정 파일만 되돌리기
git checkout HEAD~1 -- src/content/toast.ts

# 전체 커밋 되돌리기
git revert <commit-hash>

# 강제 리셋 (주의!)
git reset --hard HEAD~1
```

---

**작성일:** 2026-01-12
**버전:** 2.5.1 → 2.5.2 (예정)
