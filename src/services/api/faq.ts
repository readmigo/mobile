import { apiClient, ApiResponse } from './client';

export interface FAQCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
}

export const faqApi = {
  getCategories: async (): Promise<ApiResponse<FAQCategory[]>> => {
    const response = await apiClient.get('/faq/categories');
    return response.data;
  },

  getItems: async (categoryId?: string): Promise<ApiResponse<FAQItem[]>> => {
    const response = await apiClient.get('/faq', { params: { categoryId } });
    return response.data;
  },

  search: async (query: string): Promise<ApiResponse<FAQItem[]>> => {
    const response = await apiClient.get('/faq/search', { params: { q: query } });
    return response.data;
  },

  submitFeedback: async (data: { subject: string; message: string; email?: string }): Promise<void> => {
    await apiClient.post('/feedback', data);
  },
};
