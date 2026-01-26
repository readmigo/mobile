import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { audiobookApi, AudiobooksQueryParams } from '../services/audiobookApi';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import type { Audiobook } from '../types';

export const audiobookKeys = {
  all: ['audiobooks'] as const,
  lists: () => [...audiobookKeys.all, 'list'] as const,
  list: (params: AudiobooksQueryParams) => [...audiobookKeys.lists(), params] as const,
  details: () => [...audiobookKeys.all, 'detail'] as const,
  detail: (id: string) => [...audiobookKeys.details(), id] as const,
  forBook: (bookId: string) => [...audiobookKeys.all, 'book', bookId] as const,
  progress: (id: string) => [...audiobookKeys.all, 'progress', id] as const,
  recentlyPlayed: () => [...audiobookKeys.all, 'recently-played'] as const,
};

export function useAudiobooks(params?: AudiobooksQueryParams) {
  return useQuery({
    queryKey: audiobookKeys.list(params || {}),
    queryFn: async () => {
      const response = await audiobookApi.getAudiobooks(params);
      return response.data.data;
    },
  });
}

export function useAudiobook(id: string) {
  return useQuery({
    queryKey: audiobookKeys.detail(id),
    queryFn: async () => {
      const response = await audiobookApi.getAudiobook(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useAudiobookForBook(bookId: string) {
  return useQuery({
    queryKey: audiobookKeys.forBook(bookId),
    queryFn: async () => {
      const response = await audiobookApi.getAudiobookForBook(bookId);
      return response.data.data;
    },
    enabled: !!bookId,
  });
}

export function useAudiobookProgress(audiobookId: string) {
  return useQuery({
    queryKey: audiobookKeys.progress(audiobookId),
    queryFn: async () => {
      const response = await audiobookApi.getProgress(audiobookId);
      return response.data.data;
    },
    enabled: !!audiobookId,
  });
}

export function useRecentlyPlayedAudiobooks(limit?: number) {
  return useQuery({
    queryKey: audiobookKeys.recentlyPlayed(),
    queryFn: async () => {
      const response = await audiobookApi.getRecentlyPlayed(limit);
      return response.data.data;
    },
  });
}

export function usePlayAudiobook() {
  const queryClient = useQueryClient();
  const loadAudiobook = useAudioPlayerStore((state) => state.loadAudiobook);

  return useMutation({
    mutationFn: async ({
      audiobook,
      startChapter,
      startPosition,
    }: {
      audiobook: Audiobook;
      startChapter?: number;
      startPosition?: number;
    }) => {
      await loadAudiobook(audiobook, startChapter, startPosition);
      return audiobook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audiobookKeys.recentlyPlayed() });
    },
  });
}

export function useSearchAudiobooks(query: string, limit?: number) {
  return useQuery({
    queryKey: ['audiobooks', 'search', query],
    queryFn: async () => {
      const response = await audiobookApi.searchAudiobooks(query, limit);
      return response.data.data;
    },
    enabled: query.length > 2,
  });
}
