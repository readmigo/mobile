import { apiClient, ApiResponse } from './client';

export interface PostcardTemplate {
  id: string;
  name: string;
  previewUrl: string;
  category: string;
}

export interface Postcard {
  id: string;
  templateId: string;
  text: string;
  imageUrl: string;
  createdAt: string;
}

export const postcardsApi = {
  getTemplates: async (): Promise<ApiResponse<PostcardTemplate[]>> => {
    const response = await apiClient.get('/postcards/templates');
    return response.data;
  },

  generate: async (data: {
    templateId: string;
    text: string;
  }): Promise<ApiResponse<Postcard>> => {
    const response = await apiClient.post('/postcards/generate', data);
    return response.data;
  },

  getMyPostcards: async (): Promise<ApiResponse<Postcard[]>> => {
    const response = await apiClient.get('/postcards/my');
    return response.data;
  },

  deletePostcard: async (id: string): Promise<void> => {
    await apiClient.delete(`/postcards/${id}`);
  },
};
