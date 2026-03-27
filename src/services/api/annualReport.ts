import { apiClient, ApiResponse } from './client';

export interface AnnualReport {
  year: number;
  totalBooksRead: number;
  totalMinutesRead: number;
  totalWordsLearned: number;
  longestStreak: number;
  favoriteGenre: string;
  topBooks: { title: string; author: string; coverUrl?: string }[];
  monthlyReadingMinutes: number[];
  readingRank: string; // e.g. "Top 5% of readers"
}

export const annualReportApi = {
  getReport: async (year: number): Promise<ApiResponse<AnnualReport>> => {
    const response = await apiClient.get(`/user/annual-report/${year}`);
    return response.data;
  },

  getAvailableYears: async (): Promise<ApiResponse<number[]>> => {
    const response = await apiClient.get('/user/annual-report/years');
    return response.data;
  },
};
