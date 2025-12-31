import { useState, useCallback } from 'react';
import { AIOrchestrator } from '../services/ai/ai-orchestrator';
import { AITask, AIServiceOptions, AIApiResponse, LoadingState } from '../types';
import { handleApiError } from '../utils/errorHandler';

export function useAICall() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    text: string, 
    task: AITask, 
    options: AIServiceOptions
  ): Promise<string | AIApiResponse | string[] | null> => {
    setLoadingState('loading');
    setError(null);

    try {
      const response = await AIOrchestrator.execute(text, task, options);
      setLoadingState('success');
      return response;
    } catch (err: any) {
      console.error('AI Call failed:', err);
      const appError = handleApiError(err);
      setLoadingState('error');
      setError(appError.userMessage || appError.message);
      return null;
    }
  }, []);

  const reset = () => {
    setLoadingState('idle');
    setError(null);
  };

  return { execute, loadingState, error, reset };
}

