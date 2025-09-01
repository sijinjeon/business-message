import { AIApiResponse, AIProvider, GeminiApiRequest, OpenAIApiRequest, ClaudeApiRequest } from '@/types'

/**
 * 시스템 프롬프트 생성
 */
function createSystemPrompt(userText: string): string {
  return `
  
  
# Role
당신은 한국의 직장 문화와 커뮤니케이션에 매우 능숙한 AI 어시스턴트입니다.

# Instruction
주어진 'Original Text'를 아래 'Output Format'에 맞춰 세 가지 톤(Formal/General/Friendly)으로 변환하세요. Formal 톤은 아래 'Formal 가이드라인'을 반드시 준수하세요. 또한 모든 톤에 공통으로 아래 '공통 다듬기 원칙'을 적용하세요.

# 공통 다듬기 원칙
- 사용자가 입력한 내용을 빠짐없이 분석합니다.
- 복잡하거나 어색한 문장은 자연스럽고 읽기 쉽게 다듬습니다.
- 중문, 복문 등 사람이 이해하기 어려운 문장은 의미를 유지한 채 적절히 끊어 짧고 명확한 문장으로 재구성합니다.
- 정보의 사실관계, 의도, 요청/기한/책임 등 핵심 요소는 보존합니다.
- 비즈니스 상황에 적합한 어휘와 문체를 사용합니다.

# Formal 가이드라인 (비즈니스 문장 변환기)
## 목적
- 비즈니스 커뮤니케이션에서 사용할 문장을 정중하고 전문적인 어조로 변환
- 이메일과 비즈니스 채팅에 최적화된 표현 제공

## 변환 규칙
- 반말 → 존댓말
- 직설적 표현 → 공손한 표현
- 명확성 유지와 적절한 공손함의 균형 유지
- 불필요한 겸손 표현 제외
- 복잡한 표현 지양
- 요청 문장에는 "번거로우시겠지만", "가능하시다면" 등 완곡 표현 활용
- 거절 표현에는 "아쉽지만", "다음을 기약하다", "지금은 여건이 좋지 않다" 등 유연한 표현 활용
- 반대 표현은 "일리는 있지만", "그 점은 이해하지만", "공감하지만"처럼 상대 입장 인정으로 시작

## 제한사항
- 이모지 사용 금지
- 과도한 설명 제외
- 지나치게 굽히는 표현 지양
- 비즈니스 전문성 유지

# General 가이드라인
## 목적
- 팀 내 협업과 일상 업무 커뮤니케이션에 적합한 정중하고 부담 없는 톤
- 빠른 이해와 실행을 돕는 간결한 전달

## 변환 규칙
- 존댓말 유지, 군더더기/중복 제거, 핵심 먼저 제시
- 지시/요청은 주어·행동·기한·책임자 구성으로 명확히 표현
- 전문 용어는 필요한 경우에만 사용하고 가능한 쉬운 표현 우선
- 제안/요청: "~하면 좋겠습니다", "~부탁드립니다", "~가능할까요?" 등
- 피드백/반대: 사실→근거→제안 순서, 감정 표현은 배제
- 긴 문장은 2~3개의 짧은 문장으로 분리하여 가독성 확보

## 제한사항
- 과도한 완곡/장식 금지
- 이모지, 구어체 과다 사용 금지
- 반말 금지

# Friendly 가이드라인
## 목적
- 동료 간 캐주얼하지만 예의를 갖춘 소통
- 협업/라포 형성에 도움이 되는 따뜻하고 부담 없는 어조

## 변환 규칙
- 존댓말 기반으로 부드럽고 따뜻한 어투 사용
- 긍정적 도입/마무리 허용: "도움 주셔서 감사합니다", "잘 부탁드립니다" 등
- 요청: "~가능하실까요?", "~부탁드려요", "~도와주실 수 있을까요?" 등 가벼운 존댓말
- 거절/반대: 공감 표현으로 시작 → 대안/제안 제시
- 긴 문장은 짧게 나누고 불필요한 수식어는 제거

## 제한사항
- 이모지/과한 유머/사적 호칭 금지
- 핵심 정보(요청/기한/책임)는 반드시 포함

# Tones
1. 격식 (Formal): 'Formal 가이드라인'을 엄격히 준수
2. 일반 (General): 'General 가이드라인'을 준수
3. 친근 (Friendly): 'Friendly 가이드라인'을 준수

# Output Format
반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 절대 포함하지 마세요.

{
  "formal": "정중하고 전문적인 어조로 변환된 문장",
  "general": "정중하고 부드러운 톤으로 변환된 문장",
  "friendly": "간결하고 친근한 톤으로 변환된 문장"
}


# Original Text
${userText}`
}

/**
 * Gemini API 요청 페이로드 생성
 */
function createGeminiPayload(userText: string): GeminiApiRequest {
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
 * OpenAI API 요청 페이로드 생성
 */
function createOpenAIPayload(userText: string): OpenAIApiRequest {
  return {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: createSystemPrompt(userText)
      }
    ],
    temperature: 0.7,
    max_tokens: 1024
  }
}

/**
 * Claude API 요청 페이로드 생성
 */
function createClaudePayload(userText: string): ClaudeApiRequest {
  return {
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: createSystemPrompt(userText)
      }
    ]
  }
}

/**
 * API 응답에서 JSON 추출
 */
function extractJsonFromResponse(text: string): AIApiResponse {
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
 * Gemini API 호출
 */
async function callGeminiAPI(userText: string, apiKey: string): Promise<AIApiResponse> {
  const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
  const payload = createGeminiPayload(userText)
  
  const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Gemini API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요.')
    } else if (response.status >= 500) {
      throw new Error('Gemini 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      throw new Error(`Gemini API 호출 실패 (${response.status})`)
    }
  }
  
  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Gemini API 응답이 예상과 다릅니다.')
  }
  
  const responseText = data.candidates[0].content.parts[0].text
  return extractJsonFromResponse(responseText)
}

/**
 * OpenAI API 호출
 */
async function callOpenAIAPI(userText: string, apiKey: string): Promise<AIApiResponse> {
  const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
  const payload = createOpenAIPayload(userText)
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('OpenAI API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요.')
    } else if (response.status === 429) {
      throw new Error('OpenAI API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.')
    } else if (response.status >= 500) {
      throw new Error('OpenAI 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      throw new Error(`OpenAI API 호출 실패 (${response.status})`)
    }
  }
  
  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('OpenAI API 응답이 예상과 다릅니다.')
  }
  
  const responseText = data.choices[0].message.content
  return extractJsonFromResponse(responseText)
}

/**
 * Claude API 호출
 */
async function callClaudeAPI(userText: string, apiKey: string): Promise<AIApiResponse> {
  const API_ENDPOINT = 'https://api.anthropic.com/v1/messages'
  const payload = createClaudePayload(userText)
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Claude API 키가 유효하지 않습니다. 설정 페이지에서 확인해주세요.')
    } else if (response.status === 429) {
      throw new Error('Claude API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.')
    } else if (response.status >= 500) {
      throw new Error('Claude 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      throw new Error(`Claude API 호출 실패 (${response.status})`)
    }
  }
  
  const data = await response.json()
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Claude API 응답이 예상과 다릅니다.')
  }
  
  const responseText = data.content[0].text
  return extractJsonFromResponse(responseText)
}

/**
 * 텍스트를 세 가지 톤으로 변환 (선택된 AI 제공업체 사용)
 */
export async function convertText(userText: string, provider: AIProvider, apiKey: string): Promise<AIApiResponse> {
  if (!userText.trim()) {
    throw new Error('변환할 텍스트를 입력해주세요.')
  }
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.')
  }
  
  try {
    switch (provider) {
      case 'gemini':
        return await callGeminiAPI(userText, apiKey)
      case 'chatgpt':
        return await callOpenAIAPI(userText, apiKey)
      case 'claude':
        return await callClaudeAPI(userText, apiKey)
      default:
        throw new Error('지원하지 않는 AI 제공업체입니다.')
    }
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
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  try {
    await convertText('테스트', provider, apiKey)
    return true
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}

/**
 * AI 제공업체 정보
 */
export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google의 최신 AI 모델',
    model: 'gemini-2.0-flash-exp'
  },
  chatgpt: {
    name: 'ChatGPT',
    description: 'OpenAI의 GPT 모델',
    model: 'gpt-4o-mini'
  },
  claude: {
    name: 'Claude',
    description: 'Anthropic의 Claude 모델',
    model: 'claude-3-5-haiku-20241022'
  }
} as const