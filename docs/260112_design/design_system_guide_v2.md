# Nexus AI BCA Design Specification

---

## 1. Typography & Colors (디자인 토큰)

| 항목 (Item) | 사양 (Specification) | 비고 (Remarks) |
|-------------|---------------------|----------------|
| **Font Family** | `'Inter', 'Noto Sans KR', sans-serif` | 현대적인 가독성 확보 |
| **Primary Color** | `blue-600` (#2563eb) | 주요 액션(Primary Action) 및 브랜드 컬러 |
| **Secondary Color** | `slate-500` (#64748b) | 보조 텍스트 및 라벨(Label) |
| **Background** | `slate-50` (#f8fafc) / `white` (#ffffff) | 레이어링을 통한 시각적 구분 |
| **Border** | `slate-200` (#e2e8f0) | 1px Solid |

---

## 2. Component Design Standards (컴포넌트 표준)

### Cards (Options Page)
| 속성 | 값 |
|------|-----|
| Padding | `p-8` (32px) |
| Radius | `rounded-2xl` (16px) |
| Border | `border-slate-100` |
| Shadow | `shadow-sm` |

### Input Box (Shared)
| 속성 | 값 |
|------|-----|
| Font Size | `text-sm` (14px) |
| Padding | `p-3` (12px) |
| Radius | `rounded-xl` (12px) |
| Background | `bg-slate-50` |

### Option Chips
| 속성 | 값 |
|------|-----|
| Padding | `px-3 py-1.5` |
| Font Weight | `font-medium` (500) |
| **Active State** | `bg-blue-50`, `text-blue-700`, `border-blue-400` |

---

## 3. Layout Principles (레이아웃 원칙)

| 대상 | 규격 | 설명 |
|------|------|------|
| **Popup** | `480×600px` 고정 | 헤더/푸터 고정 및 중앙 본문(`scrollable-main`) 스크롤 |
| **Options** | 사이드바 `256px` 고정 + 메인 콘텐츠 유동적 (`max-w-5xl`) | 사이드바 + 메인 콘텐츠 레이아웃 |
| **Visual Proximity** | `mb-2` (8px) | 관련 있는 라벨과 입력창 사이의 간격 유지 |
