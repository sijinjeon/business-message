import { AIProvider, AIModel } from '../../types';

/**
 * AI 제공자별 모델 리스트 및 가격 정보 (1M 토큰 기준)
 */
export const AI_MODELS: Record<AIProvider, AIModel[]> = {
  gemini: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', pricePer1M: 15.00 },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', pricePer1M: 0.10 },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', pricePer1M: 0.075 }
  ],
  chatgpt: [
    { id: 'gpt-5.2', name: 'GPT-5.2 (Ultra Quality)', pricePer1M: 20.00 },
    { id: 'gpt-4o', name: 'GPT-4o (High Quality)', pricePer1M: 5.00 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', pricePer1M: 0.15 }
  ],
  claude: [
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude 4.5 Sonnet (Latest)', pricePer1M: 18.00 },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude 4.5 Haiku', pricePer1M: 1.00 },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (v2)', pricePer1M: 3.00 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', pricePer1M: 0.25 }
  ]
};
