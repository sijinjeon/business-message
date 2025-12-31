import { BaseAIProvider } from './base-provider';
import { AITask, AIServiceOptions, GeminiApiRequest } from '../../types';

export class GeminiProvider extends BaseAIProvider {
  name = 'gemini';

  async call(text: string, task: AITask, options: AIServiceOptions): Promise<string> {
    const isJson = task === 'tone-conversion';
    const prompt = this.buildPrompt(text, task, options);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${options.apiKey}`;

    const payload: GeminiApiRequest = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        candidateCount: 1,
        topK: 40,
        topP: 0.95,
        responseMimeType: isJson ? 'application/json' : 'text/plain'
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini API Error: No candidates returned. This might be due to safety filters.');
    }

    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error('Gemini API Error: Empty content in response.');
    }

    return content.parts[0].text;
  }
}

