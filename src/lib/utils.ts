import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 텍스트를 문장 단위로 분리하는 함수
 * 한국어 문장 종결 부호(., !, ?)를 기준으로 분리
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return []
  
  // 문장 종결 부호(., !, ?) 뒤에 공백이 있거나 문자열 끝인 경우를 기준으로 분리
  // 단, 숫자나 영문 약어(예: Mr., Dr.) 등은 제외
  const sentences = text
    .split(/([.!?])\s+(?=[가-힣A-Z])|([.!?])$/g)
    .filter(Boolean)
    .reduce((acc: string[], curr, idx, arr) => {
      // 문장 종결 부호 처리
      if (curr.match(/^[.!?]$/)) {
        if (acc.length > 0) {
          acc[acc.length - 1] += curr
        }
      } else if (!curr.match(/^[.!?]$/)) {
        // 이전 요소가 문장 종결 부호가 아니면 새로운 문장으로 추가
        if (idx === 0 || !arr[idx - 1]?.match(/^[.!?]$/)) {
          acc.push(curr.trim())
        } else {
          // 이전 문장에 추가
          if (acc.length > 0) {
            acc[acc.length - 1] += curr.trim()
          } else {
            acc.push(curr.trim())
          }
        }
      }
      return acc
    }, [])
    .filter(s => s.length > 0)
  
  return sentences.length > 0 ? sentences : [text]
}
