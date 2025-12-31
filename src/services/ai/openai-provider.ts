import { BaseAIProvider } from './base-provider';
import { AITask, AIServiceOptions, OpenAIApiRequest } from '../../types';

export class OpenAIProvider extends BaseAIProvider {
  name = 'chatgpt';

  async call(text: string, task: AITask, options: AIServiceOptions): Promise<string> {
    const isJson = task === 'tone-conversion';
    const prompt = this.buildPrompt(text, task, options);
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const payload: OpenAIApiRequest = {
      model: options.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: isJson ? { type: 'json_object' } : undefined
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

