import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi, LearningStats, WeeklyStats, MonthlyStats, DailyGoalProgress } from '@/services/api/learning';
import { useLearningStore } from '../stores/learningStore';

export const learningKeys = {
  all: ['learning'] as const,
  today: () => [...learningKeys.all, 'today'] as const,
  weekly: (offset: number) => [...learningKeys.all, 'weekly', offset] as const,
  monthly: (year: number, month: number) => [...learningKeys.all, 'monthly', year, month] as const,
  goals: () => [...learningKeys.all, 'goals'] as const,
  streak: () => [...learningKeys.all, 'streak'] as const,
  history: (page: number) => [...learningKeys.all, 'history', page] as const,
};

export function useTodayStats() {
  const { todayProgress, currentStreak, longestStreak } = useLearningStore();

  return useQuery({
    queryKey: learningKeys.today(),
    queryFn: async () => {
      try {
        const response = await learningApi.getTodayStats();
        return response.data.data;
      } catch {
        // Return local stats if API fails
        return {
          today: {
            date: new Date().toISOString().split('T')[0],
            wordsLearned: todayProgress.wordsLearned,
            wordsReviewed: todayProgress.wordsReviewed,
            readingTimeMinutes: todayProgress.readingMinutes,
            pagesRead: todayProgress.pagesRead,
            streak: currentStreak,
            goalAchieved: false,
          },
          streak: {
            current: currentStreak,
            longest: longestStreak,
            lastActiveDate: new Date().toISOString().split('T')[0],
          },
          totalWords: 0,
          masteredWords: 0,
          learningWords: 0,
          reviewDueToday: 0,
        } as LearningStats;
      }
    },
    staleTime: 60000, // 1 minute
  });
}

export function useWeeklyStats(weekOffset = 0) {
  return useQuery({
    queryKey: learningKeys.weekly(weekOffset),
    queryFn: async () => {
      const response = await learningApi.getWeeklyStats(weekOffset);
      return response.data.data;
    },
  });
}

export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: learningKeys.monthly(year, month),
    queryFn: async () => {
      const response = await learningApi.getMonthlyStats(year, month);
      return response.data.data;
    },
  });
}

export function useGoalProgress() {
  const { todayProgress } = useLearningStore();

  return useQuery({
    queryKey: learningKeys.goals(),
    queryFn: async () => {
      try {
        const response = await learningApi.getGoalProgress();
        return response.data.data;
      } catch {
        // Return local progress if API fails
        return {
          wordsLearned: todayProgress.wordsLearned,
          wordsTarget: 20,
          readingMinutes: todayProgress.readingMinutes,
          readingTarget: 30,
          percentComplete: Math.min(100, (todayProgress.wordsLearned / 20) * 100),
          isComplete: todayProgress.wordsLearned >= 20,
        } as DailyGoalProgress;
      }
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useUpdateDailyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wordsTarget, readingTarget }: { wordsTarget: number; readingTarget?: number }) => {
      await learningApi.updateDailyGoal(wordsTarget, readingTarget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.goals() });
    },
  });
}

export function useLearningHistory(page = 1) {
  return useQuery({
    queryKey: learningKeys.history(page),
    queryFn: async () => {
      const response = await learningApi.getLearningHistory(page);
      return response.data.data;
    },
  });
}

export function useRecordSession() {
  const queryClient = useQueryClient();
  const { endReadingSession, addReadingTime } = useLearningStore();

  return useMutation({
    mutationFn: async () => {
      const session = endReadingSession();
      if (session && session.duration > 0) {
        // Optionally sync with server
        // await learningApi.recordReadingSession(...)
      }
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.today() });
    },
  });
}
