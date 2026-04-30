import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '@/services/api/series';

export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...seriesKeys.lists(), params] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...seriesKeys.details(), id] as const,
};

export function useSeriesList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  authorId?: string;
}) {
  return useQuery({
    queryKey: seriesKeys.list(params ?? {}),
    queryFn: () => seriesApi.getSeriesList(params),
  });
}

export function useSeriesDetail(id: string) {
  return useQuery({
    queryKey: seriesKeys.detail(id),
    queryFn: () => seriesApi.getSeriesDetail(id),
    enabled: !!id,
  });
}
