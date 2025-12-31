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
    if (!text || text.trim() === '') {
      throw new Error('AI로부터 빈 응답을 받았습니다.');
    }

    // 1. Markdown block extraction (with or without 'json' tag)
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonCandidate = '';

    if (markdownMatch) {
      jsonCandidate = markdownMatch[1].trim();
    } else {
      // 2. Search for the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonCandidate = text.substring(firstBrace, lastBrace + 1).trim();
      } else {
        // 3. If no braces, but the whole text might be a JSON (unlikely for objects but still)
        jsonCandidate = text.trim();
      }
    }

    try {
      // Clean up potential control characters that JSON.parse hates
      const cleaned = jsonCandidate.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      const parsed = JSON.parse(cleaned);
      
      // 필수 필드 확인 (최소 하나는 있어야 함)
      if (!parsed.formal && !parsed.general && !parsed.friendly) {
        throw new Error('유효한 톤 변환 결과를 찾을 수 없습니다.');
      }
      
      return parsed;
    } catch (e) {
      console.error('JSON parsing failed. Candidate:', jsonCandidate);
      
      // 만약 JSON 파싱은 실패했지만 텍스트가 일반 텍스트라면? 
      // 하지만 이 태스크는 반드시 JSON을 반환해야 함.
      throw new Error('유효한 JSON 응답을 찾을 수 없습니다. (응답 내용: ' + text.substring(0, 50) + '...)');
    }
  }
}

