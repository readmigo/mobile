import { apiClient, ApiResponse } from './client';

export interface DailyStats {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  readingTimeMinutes: number;
  pagesRead: number;
  streak: number;
  goalAchieved: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWordsLearned: number;
  totalWordsReviewed: number;
  totalReadingTimeMinutes: number;
  totalPagesRead: number;
  averagePerDay: number;
  bestDay: string;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalWordsLearned: number;
  totalWordsReviewed: number;
  totalReadingTimeMinutes: number;
  totalPagesRead: number;
  longestStreak: number;
  currentStreak: number;
  weeklyStats: WeeklyStats[];
}

export interface LearningStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export interface LearningStats {
  today: DailyStats;
  streak: LearningStreak;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewDueToday: number;
}

export interface ReadingSession {
  bookId: string;
  startTime: string;
  endTime: string;
  pagesRead: number;
  wordsLearned: number;
  cfiStart: string;
  cfiEnd: string;
}

export interface DailyGoalProgress {
  wordsLearned: number;
  wordsTarget: number;
  readingMinutes: number;
  readingTarget: number;
  percentComplete: number;
  isComplete: boolean;
}

export const learningApi = {
  // Get today's stats
  getTodayStats: () =>
    apiClient.get<ApiResponse<LearningStats>>('/learning/stats/today'),

  // Get daily stats for a specific date
  getDailyStats: (date: string) =>
    apiClient.get<ApiResponse<DailyStats>>(`/learning/stats/daily/${date}`),

  // Get weekly stats
  getWeeklyStats: (weekOffset = 0) =>
    apiClient.get<ApiResponse<WeeklyStats>>('/learning/stats/weekly', {
      params: { weekOffset },
    }),

  // Get monthly stats
  getMonthlyStats: (year: number, month: number) =>
    apiClient.get<ApiResponse<MonthlyStats>>('/learning/stats/monthly', {
      params: { year, month },
    }),

  // Get goal progress
  getGoalProgress: () =>
    apiClient.get<ApiResponse<DailyGoalProgress>>('/learning/goals/progress'),

  // Update daily goal
  updateDailyGoal: (wordsTarget: number, readingMinutesTarget?: number) =>
    apiClient.put<ApiResponse<void>>('/learning/goals', {
      wordsTarget,
      readingMinutesTarget,
    }),

  // Record reading session
  recordReadingSession: (session: ReadingSession) =>
    apiClient.post<ApiResponse<void>>('/learning/sessions', session),

  // Get learning history (paginated)
  getLearningHistory: (page = 1, pageSize = 30) =>
    apiClient.get<ApiResponse<{ stats: DailyStats[]; total: number }>>('/learning/history', {
      params: { page, pageSize },
    }),

  // Get streak info
  getStreak: () =>
    apiClient.get<ApiResponse<LearningStreak>>('/learning/streak'),
};
