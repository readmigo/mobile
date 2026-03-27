import { apiClient, ApiResponse } from './client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-1 for partial progress
  requirement?: string;
}

export const badgesApi = {
  getBadges: async (): Promise<ApiResponse<Badge[]>> => {
    const response = await apiClient.get('/user/badges');
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/user/badges/categories');
    return response.data;
  },
};
