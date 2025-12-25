import { AIProvider, AITask, AIServiceOptions, AIApiResponse } from '../../types';
import { BaseAIProvider } from './base-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { AI_MODELS } from './models';

export { AI_MODELS };

export class AIOrchestrator {
  private static providers: Record<AIProvider, BaseAIProvider> = {
    gemini: new GeminiProvider(),
    chatgpt: new OpenAIProvider(),
    claude: new ClaudeProvider()
  };

  /**
   * 통합 AI 실행 메서드
   */
  static async execute(text: string, task: AITask, options: AIServiceOptions): Promise<string | AIApiResponse | string[]> {
    const provider = this.providers[options.provider];
    if (!provider) throw new Error(`지원하지 않는 제공자입니다: ${options.provider}`);

    const resultText = await provider.call(text, task, options);

    if (task === 'tone-conversion') {
      return this.parseJson(resultText) as AIApiResponse;
    }

    return resultText.trim();
  }

  private static parseJson(text: string): AIApiResponse {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('유효한 JSON 응답을 찾을 수 없습니다.');
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      throw new Error('AI 응답 파싱 실패');
    }
  }
}

