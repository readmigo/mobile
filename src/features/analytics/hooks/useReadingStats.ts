import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services/api/stats';

export const statsKeys = {
  all: ['stats'] as const,
  reading: ['stats', 'reading'] as const,
  weekly: ['stats', 'weekly'] as const,
};

export function useReadingStats() {
  return useQuery({
    queryKey: statsKeys.reading,
    queryFn: async () => {
      const response = await statsApi.getReadingStats();
      return response.data;
    },
  });
}

export function useWeeklyTrend() {
  return useQuery({
    queryKey: statsKeys.weekly,
    queryFn: async () => {
      const response = await statsApi.getWeeklyTrend();
      return response.data;
    },
  });
}
