import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, UserBook } from '@/services/api/books';
import { queryKeys } from '@/services/queryClient';

export const libraryKeys = {
  ...queryKeys.library,
  recentlyBrowsed: ['library', 'recently-browsed'] as const,
  favorites: ['library', 'favorites'] as const,
};

export function useUserLibrary() {
  return useQuery({
    queryKey: libraryKeys.books,
    queryFn: async () => {
      const response = await booksApi.getUserLibrary();
      return response.data;
    },
  });
}

export function useCurrentlyReading() {
  const { data: library, ...rest } = useUserLibrary();

  const currentlyReading = library
    ?.filter((ub) => !ub.isCompleted && ub.progress > 0)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())[0] ?? null;

  return { data: currentlyReading, ...rest };
}

export function useRecentlyBrowsed() {
  return useQuery({
    queryKey: libraryKeys.recentlyBrowsed,
    queryFn: async () => {
      const response = await booksApi.getRecentlyBrowsed({ pageSize: 10 });
      return response.data;
    },
  });
}

export function useFavoriteBooks() {
  return useQuery({
    queryKey: libraryKeys.favorites,
    queryFn: async () => {
      const response = await booksApi.getFavoriteBooks({ pageSize: 12 });
      return response.data;
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => booksApi.toggleFavorite(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books });
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => booksApi.removeFromLibrary(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });
}
