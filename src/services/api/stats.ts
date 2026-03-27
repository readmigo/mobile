import { apiClient, ApiResponse } from './client';

export interface ReadingStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  totalMinutes: number;
  booksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  vocabularyCount: number;
  vocabularyReviewPending: number;
}

export interface DailyReading {
  date: string;
  minutes: number;
}

export interface WeeklyTrend {
  days: DailyReading[];
}

export const statsApi = {
  getReadingStats: async (): Promise<ApiResponse<ReadingStats>> => {
    const response = await apiClient.get('/user/reading-stats');
    return response.data;
  },

  getWeeklyTrend: async (): Promise<ApiResponse<WeeklyTrend>> => {
    const response = await apiClient.get('/user/reading-stats/weekly');
    return response.data;
  },
};
