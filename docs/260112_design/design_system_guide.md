# **Nexus AI BCA Integrated Design System Guide**

## **1\. 개요 (Overview)**

본 문서는 'Popup'과 'Options' 화면에 공통 적용되는 디자인 토큰과 레이아웃 사양을 정의합니다.

## **2\. 공통 디자인 토큰 (Shared Design Tokens)**

* **Primary Action**: blue-600 (\#2563eb) \- 주요 버튼 및 활성 상태  
* **Backgrounds**:  
  * Popup: bg-white (고정형)  
  * Options: bg-slate-50 (전체 배경) / bg-white (섹션 카드)  
* **Input/Form**: bg-slate-50, border-slate-200, rounded-xl (12px)  
* **Typography**: font-sans (Inter & Noto Sans KR), leading-relaxed

## **3\. 화면별 구현 사양 (Platform Specifications)**

### **A. 팝업 (Popup \- 480x600px)**

* **레이아웃**: 상하단 고정(Fixed), 중앙 스크롤(scrollable-main).  
* **특이사항**: 입력창과 결과창의 시각적 일관성을 유지하되 결과창에만 bg-blue-50/40 적용.

### **B. 설정 (Options \- Dashboard)**

* **레이아웃**: max-w-4xl 중앙 정렬 카드 레이아웃.  
* **섹션화(Sectioning)**:  
  * Card Class: bg-white border border-slate-100 rounded-2xl p-6 shadow-sm  
  * 각 설정 항목(API Key, 모델 선택)은 개별 카드로 분리하여 배치.  
* **일관성**: 팝업에서 사용한 .option-chip 컴포넌트를 설정창의 '기본 톤 선택' 메뉴에도 동일하게 적용.

## **4\. 컴포넌트 매핑 테이블 (Component Mapping)**

| 기능 | UI ID (Popup) | UI ID (Options) | 스타일 사양 |  
| API 입력 | N/A | \#openai-key 등 | .input-box-shared |  
| 모드 선택 | \#btn-tone | N/A | .mode-tab |  
| 톤 설정 | .option-chip | .default-tone-chip | .option-chip.active |  
| 저장 버튼 | \#copy-btn | \#save-settings | .btn-primary (Blue) |

## **5\. 커서(Cursor) 실행 지침**

* 팝업의 bca\_popup\_v2.html 내 \<style\> 태그에 정의된 CSS를 전역 클래스화하거나 Tailwind 유틸리티로 완벽히 치환하십시오.  
* Options 화면에서도 팝업과 동일한 폰트 크기(text-sm)와 여백(p-4, p-6) 시스템을 유지하여 이질감을 제거하십시오.