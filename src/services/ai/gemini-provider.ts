import { BaseAIProvider } from './base-provider';
import { AITask, AIServiceOptions, GeminiApiRequest } from '../../types';

export class GeminiProvider extends BaseAIProvider {
  name = 'gemini';

  async call(text: string, task: AITask, options: AIServiceOptions): Promise<string> {
    const isJson = task === 'tone-conversion';
    const prompt = this.buildPrompt(text, task, options.targetLanguage);
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

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

