import { BaseAIProvider } from './base-provider';
import { AITask, AIServiceOptions, ClaudeApiRequest } from '../../types';

export class ClaudeProvider extends BaseAIProvider {
  name = 'claude';

  async call(text: string, task: AITask, options: AIServiceOptions): Promise<string> {
    const prompt = this.buildPrompt(text, task, options);
    const endpoint = 'https://api.anthropic.com/v1/messages';

    // API 키 기본 형식 검증 (sk-ant- 시작 여부)
    if (options.apiKey && !options.apiKey.trim().startsWith('sk-ant-')) {
      throw new Error('Claude API 키 형식이 올바르지 않습니다. (sk-ant-... 형식이어야 합니다)');
    }

    const payload: ClaudeApiRequest = {
      model: options.model,
      max_tokens: 2048,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 401 오류 시 사용자에게 더 명확한 안내 제공
      if (response.status === 401) {
        throw new Error('Claude API 인증 실패: 입력하신 API 키가 유효하지 않거나 만료되었습니다. Anthropic 콘솔에서 키를 다시 확인해주세요.');
      }
      
      throw new Error(`Claude API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return data.content[0].text;
  }
}



