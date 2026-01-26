import { apiClient, ApiResponse } from './client';

export interface ExplainRequest {
  text: string;
  context?: string;
  bookId?: string;
  chapterId?: string;
}

export interface ExplainResponse {
  explanation: string;
  pronunciation?: string;
  examples?: string[];
  relatedWords?: string[];
}

export interface SimplifyRequest {
  text: string;
  targetLevel?: 'basic' | 'intermediate' | 'advanced';
}

export interface SimplifyResponse {
  simplifiedText: string;
  changes?: Array<{
    original: string;
    simplified: string;
  }>;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface SavedWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
  context?: string;
  bookId?: string;
  bookTitle?: string;
  createdAt: string;
  masteryLevel: number;
  nextReviewAt?: string;
}

export const aiApi = {
  explain: async (data: ExplainRequest): Promise<ApiResponse<ExplainResponse>> => {
    const response = await apiClient.post('/ai/explain', data);
    return response.data;
  },

  simplify: async (data: SimplifyRequest): Promise<ApiResponse<SimplifyResponse>> => {
    const response = await apiClient.post('/ai/simplify', data);
    return response.data;
  },

  translate: async (data: TranslateRequest): Promise<ApiResponse<TranslateResponse>> => {
    const response = await apiClient.post('/ai/translate', data);
    return response.data;
  },

  // Vocabulary
  saveWord: async (data: Omit<SavedWord, 'id' | 'createdAt' | 'masteryLevel' | 'nextReviewAt'>): Promise<ApiResponse<SavedWord>> => {
    const response = await apiClient.post('/vocabulary', data);
    return response.data;
  },

  getSavedWords: async (params?: {
    bookId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<SavedWord[]>> => {
    const response = await apiClient.get('/vocabulary', { params });
    return response.data;
  },

  deleteWord: async (wordId: string): Promise<void> => {
    await apiClient.delete(`/vocabulary/${wordId}`);
  },

  updateWordMastery: async (wordId: string, masteryLevel: number): Promise<ApiResponse<SavedWord>> => {
    const response = await apiClient.patch(`/vocabulary/${wordId}/mastery`, { masteryLevel });
    return response.data;
  },

  getWordsForReview: async (): Promise<ApiResponse<SavedWord[]>> => {
    const response = await apiClient.get('/vocabulary/review');
    return response.data;
  },
};
