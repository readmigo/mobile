import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (previously cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
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
