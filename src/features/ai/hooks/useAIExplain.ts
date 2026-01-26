import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aiApi,
  ExplainRequest,
  ExplainResponse,
  SimplifyRequest,
  SimplifyResponse,
  TranslateRequest,
  TranslateResponse,
} from '@/services/api/ai';

interface UseAIExplainOptions {
  onSuccess?: (data: ExplainResponse) => void;
  onError?: (error: Error) => void;
}

export function useAIExplain(options?: UseAIExplainOptions) {
  const mutation = useMutation({
    mutationFn: async (request: ExplainRequest) => {
      const response = await aiApi.explain(request);
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  const explain = (text: string, context?: string, bookId?: string) => {
    return mutation.mutateAsync({ text, context, bookId });
  };

  return {
    explain,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

interface UseAITranslateOptions {
  onSuccess?: (data: TranslateResponse) => void;
  onError?: (error: Error) => void;
}

export function useAITranslate(options?: UseAITranslateOptions) {
  const mutation = useMutation({
    mutationFn: async (request: TranslateRequest) => {
      const response = await aiApi.translate(request);
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  const translate = (text: string, targetLanguage: string, sourceLanguage?: string) => {
    return mutation.mutateAsync({ text, targetLanguage, sourceLanguage });
  };

  return {
    translate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

interface UseAISimplifyOptions {
  onSuccess?: (data: SimplifyResponse) => void;
  onError?: (error: Error) => void;
}

export function useAISimplify(options?: UseAISimplifyOptions) {
  const mutation = useMutation({
    mutationFn: async (request: SimplifyRequest) => {
      const response = await aiApi.simplify(request);
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  const simplify = (text: string, targetLevel?: 'basic' | 'intermediate' | 'advanced') => {
    return mutation.mutateAsync({ text, targetLevel });
  };

  return {
    simplify,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function useAIActions() {
  const explainMutation = useMutation({
    mutationFn: (request: ExplainRequest) => aiApi.explain(request).then(r => r.data),
  });

  const translateMutation = useMutation({
    mutationFn: (request: TranslateRequest) => aiApi.translate(request).then(r => r.data),
  });

  const simplifyMutation = useMutation({
    mutationFn: (request: SimplifyRequest) => aiApi.simplify(request).then(r => r.data),
  });

  return {
    explain: explainMutation,
    translate: translateMutation,
    simplify: simplifyMutation,
  };
}
