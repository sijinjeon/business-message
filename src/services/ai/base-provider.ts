import { AITask, AIServiceOptions } from '../../types';

export abstract class BaseAIProvider {
  abstract name: string;

  /**
   * AI 엔진 호출 메인 메서드
   */
  abstract call(text: string, task: AITask, options: AIServiceOptions): Promise<string>;

  /**
   * 태스크별 프롬프트 생성 (공통 로직)
   */
  protected buildPrompt(text: string, task: AITask, options: AIServiceOptions): string {
    if (task === 'translation') {
      return `
# Role
Professional translator.

# Task
Translate the following text to ${options.targetLanguage || 'Korean'}.

# Critical Rules
1. PRESERVE ALL LINE BREAKS (\\n) EXACTLY.
2. Natural and professional tone.
3. Output ONLY the translation result.

# Original Text
${text}

# Translation
`;
    }

    if (options.tone) {
      const toneLabels: Record<string, string> = {
        formal: '매우 격식 있고 예의 바른 비즈니스 어조 (공식적인 메일이나 공지에 적합)',
        general: '정중하면서도 부드러운 일상적인 비즈니스 어조 (팀 내 협업이나 일반적인 대화에 적합)',
        friendly: '간결하고 친근한 어조 (가까운 동료나 편안한 사이에 적합)'
      };

      return `
# Role
한국 직장 문화와 커뮤니케이션에 능숙한 AI 어시스턴트.

# Instruction
주어진 'Original Text'를 아래 톤으로 변환하여 반드시 지정된 JSON 형식으로만 응답하세요.

# Tone
${options.tone}: ${toneLabels[options.tone]}

# Critical Rules
- 반드시 아래 JSON 구조를 유지하세요.
- 설명이나 인사말 등 JSON 이외의 텍스트는 절대 포함하지 마세요.
- 원문의 의미를 훼손하지 않으면서 톤만 자연스럽게 변경하세요.

# Output Format (JSON ONLY)
{
  "${options.tone}": "..."
}

# Original Text
${text}
`;
    }

    return `
# Role
한국 직장 문화와 커뮤니케이션에 능숙한 AI 어시스턴트.

# Instruction
주어진 'Original Text'를 아래 세 가지 톤으로 변환하여 반드시 지정된 JSON 형식으로만 응답하세요.

# Tones
1. formal: 매우 격식 있고 예의 바른 비즈니스 어조 (공식적인 메일이나 공지에 적합)
2. general: 정중하면서도 부드러운 일상적인 비즈니스 어조 (팀 내 협업이나 일반적인 대화에 적합)
3. friendly: 간결하고 친근한 어조 (가까운 동료나 편안한 사이에 적합)

# Critical Rules
- 반드시 아래 JSON 구조를 유지하세요.
- 설명이나 인사말 등 JSON 이외의 텍스트는 절대 포함하지 마세요.
- 원문의 의미를 훼손하지 않으면서 톤만 자연스럽게 변경하세요.

# Output Format (JSON ONLY)
{
  "formal": "...",
  "general": "...",
  "friendly": "..."
}

# Original Text
${text}
`;
  }
}

