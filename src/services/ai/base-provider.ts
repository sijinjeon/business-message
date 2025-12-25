import { AITask, AIServiceOptions, AIApiResponse } from '../../types';

export abstract class BaseAIProvider {
  abstract name: string;

  /**
   * AI 엔진 호출 메인 메서드
   */
  abstract call(text: string, task: AITask, options: AIServiceOptions): Promise<string>;

  /**
   * 태스크별 프롬프트 생성 (공통 로직)
   */
  protected buildPrompt(text: string, task: AITask, targetLanguage?: string): string {
    if (task === 'translation') {
      return `
# Role
Professional translator.

# Task
Translate the following text to ${targetLanguage || 'Korean'}.

# Critical Rules
1. PRESERVE ALL LINE BREAKS (\\n) EXACTLY.
2. Natural and professional tone.
3. Output ONLY the translation result.

# Original Text
${text}

# Translation
`;
    }

    return `
# Role
한국 직장 문화와 커뮤니케이션에 능숙한 AI 어시스턴트.

# Instruction
주어진 'Original Text'를 아래 JSON 형식에 맞춰 세 가지 톤(격식/일반/친근)으로 변환하세요.

# Output Format
반드시 아래 JSON 형식으로만 응답하세요. 설명은 생략합니다.
{
  "formal": "정중하고 전문적인 어조",
  "general": "정중하고 부드러운 톤",
  "friendly": "간결하고 친근한 톤"
}

# Original Text
${text}
`;
  }

  /**
   * JSON 응답 파싱 (톤 변환용)
   */
  protected parseJsonResponse(text: string): AIApiResponse {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('유효한 JSON 응답을 찾을 수 없습니다.');
    
    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      if (!parsed.formal || !parsed.general || !parsed.friendly) {
        throw new Error('필수 필드가 누락되었습니다.');
      }
      return parsed;
    } catch (e) {
      throw new Error('AI 응답 파싱 실패');
    }
  }
}

