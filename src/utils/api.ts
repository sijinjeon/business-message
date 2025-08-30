import { GeminiApiRequest, GeminiApiResponse } from '@/types'

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

/**
 * 시스템 프롬프트 생성
 */
function createSystemPrompt(userText: string): string {
  return `# Role
당신은 한국의 직장 문화와 커뮤니케이션에 매우 능숙한 AI 어시스턴트입니다.

# Instruction
주어진 '원본 텍스트'를 아래 '출력 형식'에 맞춰 세 가지 톤으로 변환해주세요. 각 톤은 한국의 업무 환경에 적합해야 하며, 자연스럽고 명확하게 작성해야 합니다.

# Tones
1. **격식 (Formal):** 상사, 외부 고객, 공식적인 문서에 사용하는 매우 정중하고 격식 있는 톤.
2. **일반 (General):** 일반적인 동료와의 협업, 팀 내 커뮤니케이션에 사용하는 정중하지만 부드러운 톤.
3. **친근 (Friendly):** 친한 동료와의 일상적인 대화에 사용하는 간결하고 친근한 톤.

# Output Format
반드시 아래와 같은 JSON 형식으로만 응답해야 합니다. 다른 설명은 절대 추가하지 마세요.
\`\`\`json
{
  "formal": "여기에 격식있는 톤의 변환 결과를 작성하세요.",
  "general": "여기에 일반적인 동료 톤의 변환 결과를 작성하세요.",
  "friendly": "여기에 친근한 톤의 변환 결과를 작성하세요."
}
\`\`\`

# Original Text
${userText}`
}

/**
 * API 요청 페이로드 생성
 */
function createApiPayload(userText: string): GeminiApiRequest {
  return {
    contents: [{
      parts: [{
        text: createSystemPrompt(userText)
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      candidateCount: 1,
      topK: 40,
      topP: 0.95
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  }
}

/**
 * API 응답에서 JSON 추출
 */
function extractJsonFromResponse(text: string): GeminiApiResponse {
  // JSON 블록 찾기
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('API 응답에서 JSON을 찾을 수 없습니다.')
  }
  
  try {
    const jsonText = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonText)
    
    if (!parsed.formal || !parsed.general || !parsed.friendly) {
      throw new Error('API 응답 형식이 올바르지 않습니다.')
    }
    
    return {
      formal: parsed.formal.trim(),
      general: parsed.general.trim(),
      friendly: parsed.friendly.trim()
    }
  } catch (error) {
    console.error('JSON parsing error:', error)
    throw new Error('API 응답을 파싱할 수 없습니다.')
  }
}

/**
 * 텍스트를 세 가지 톤으로 변환
 */
export async function convertText(userText: string, apiKey: string): Promise<GeminiApiResponse> {
  if (!userText.trim()) {
    throw new Error('변환할 텍스트를 입력해주세요.')
  }
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.')
  }
  
  const payload = createApiPayload(userText)
  
  try {
    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요.')
      } else if (response.status >= 500) {
        throw new Error('AI 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        throw new Error(`API 호출 실패 (${response.status})`)
      }
    }
    
    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('API 응답이 예상과 다릅니다.')
    }
    
    const responseText = data.candidates[0].content.parts[0].text
    return extractJsonFromResponse(responseText)
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('네트워크 연결을 확인해주세요.')
  }
}

/**
 * API 키 유효성 검증
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await convertText('테스트', apiKey)
    return true
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}
