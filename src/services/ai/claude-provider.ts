import { BaseAIProvider } from './base-provider';
import { AITask, AIServiceOptions, ClaudeApiRequest } from '../../types';

export class ClaudeProvider extends BaseAIProvider {
  name = 'claude';

  async call(text: string, task: AITask, options: AIServiceOptions): Promise<string> {
    const prompt = this.buildPrompt(text, task, options.targetLanguage);
    const endpoint = 'https://api.anthropic.com/v1/messages';

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
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Claude API Error: ${response.status}`);
    const data = await response.json();
    return data.content[0].text;
  }
}

