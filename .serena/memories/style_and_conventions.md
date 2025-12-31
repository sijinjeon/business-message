# 코드 스타일 및 관례

## 기술적 관례
- TypeScript를 기본 언어로 사용하며 엄격한 타입 체크 지향
- React Functional Components와 Hooks 사용
- UI 컴포넌트는 `src/components/ui`에 위치하며 shadcn/ui 기반
- 서비스 로직은 `src/services`에 위치하여 UI와 비즈니스 로직 분리
- 비동기 AI 호출 시 에러 핸들링 철저 (사용자에게 친숙한 에러 메시지 제공)

## 명명 규칙
- 컴포넌트 파일: PascalCase (예: `ResultCard.tsx`)
- 유틸리티/서비스 파일: kebab-case (예: `storage-service.ts`)
- 변수 및 함수: camelCase
