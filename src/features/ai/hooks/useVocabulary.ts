import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { aiApi, SavedWord } from '@/services/api/ai';

export const vocabularyKeys = {
  all: ['vocabulary'] as const,
  lists: () => [...vocabularyKeys.all, 'list'] as const,
  list: (params: { bookId?: string; page?: number }) => [...vocabularyKeys.lists(), params] as const,
  review: () => [...vocabularyKeys.all, 'review'] as const,
};

interface VocabularyListParams {
  bookId?: string;
  pageSize?: number;
}

export function useVocabularyList(params?: VocabularyListParams) {
  const { bookId, pageSize = 20 } = params || {};

  return useInfiniteQuery({
    queryKey: vocabularyKeys.list({ bookId }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await aiApi.getSavedWords({ bookId, page: pageParam, pageSize });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

export function useSaveVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<SavedWord, 'id' | 'createdAt' | 'masteryLevel' | 'nextReviewAt'>) => {
      const response = await aiApi.saveWord(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
    },
  });
}

export function useDeleteVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await aiApi.deleteWord(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
    },
  });
}

export function useReviewWords() {
  return useQuery({
    queryKey: vocabularyKeys.review(),
    queryFn: async () => {
      const response = await aiApi.getWordsForReview();
      return response.data;
    },
  });
}

export function useUpdateMastery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wordId, masteryLevel }: { wordId: string; masteryLevel: number }) => {
      const response = await aiApi.updateWordMastery(wordId, masteryLevel);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.review() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
    },
  });
}
