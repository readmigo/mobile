import { apiClient, ApiResponse } from './client';

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: string;
  isFavorite: boolean;
}

export const quotesApi = {
  getDaily: async (): Promise<ApiResponse<Quote>> => {
    const response = await apiClient.get('/quotes/daily');
    return response.data;
  },

  getByCategory: async (category?: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Quote[]>> => {
    const response = await apiClient.get('/quotes', { params: { category, ...params } });
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/quotes/categories');
    return response.data;
  },

  toggleFavorite: async (quoteId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/favorite`);
  },

  getFavorites: async (): Promise<ApiResponse<Quote[]>> => {
    const response = await apiClient.get('/quotes/favorites');
    return response.data;
  },
};
