import { QueryClient } from '@tanstack/react-query';
import { handleApiError } from './api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (previously cacheTime)
      retry: (failureCount, error) => {
        const appError = handleApiError(error);
        if (!appError.isRetryable) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        const appError = handleApiError(error);
        // Only retry NETWORK/TIMEOUT — don't retry SERVER (might double-write)
        if (appError.code !== 'NETWORK' && appError.code !== 'TIMEOUT') return false;
        return failureCount < 1;
      },
      retryDelay: 1000,
    },
  },
});

// Query Keys
export const queryKeys = {
  // Auth
  profile: ['profile'] as const,

  // Books
  books: {
    all: ['books'] as const,
    list: (params?: Record<string, unknown>) => ['books', 'list', params] as const,
    detail: (id: string) => ['books', 'detail', id] as const,
    search: (query: string) => ['books', 'search', query] as const,
    categories: ['books', 'categories'] as const,
  },

  // User Library
  library: {
    all: ['library'] as const,
    books: ['library', 'books'] as const,
    recentlyBrowsed: ['library', 'recently-browsed'] as const,
    favorites: ['library', 'favorites'] as const,
    progress: (bookId: string) => ['library', 'progress', bookId] as const,
  },

  // Vocabulary
  vocabulary: {
    all: ['vocabulary'] as const,
    list: (params?: Record<string, unknown>) => ['vocabulary', 'list', params] as const,
    review: ['vocabulary', 'review'] as const,
  },

  // Learning
  learning: {
    stats: ['learning', 'stats'] as const,
    dailyProgress: ['learning', 'daily'] as const,
  },
} as const;
