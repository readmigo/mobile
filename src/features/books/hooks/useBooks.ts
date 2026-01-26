import { useQuery } from '@tanstack/react-query';
import { booksApi, Book } from '@/services/api/books';
import { searchApi, SearchBook } from '@/services/api/search';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  search: (query: string) => [...bookKeys.all, 'search', query] as const,
  categories: () => [...bookKeys.all, 'categories'] as const,
};

export function useBooks(params?: {
  category?: string;
  difficulty?: number;
  language?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: bookKeys.list(params || {}),
    queryFn: async () => {
      const response = await booksApi.getBooks(params);
      return response.data;
    },
  });
}

export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: bookKeys.detail(bookId),
    queryFn: async () => {
      const response = await booksApi.getBookDetail(bookId);
      return response.data;
    },
    enabled: !!bookId,
  });
}

export function useSearchBooks(query: string, limit: number = 20) {
  return useQuery({
    queryKey: bookKeys.search(query),
    queryFn: async () => {
      const response = await searchApi.search(query, limit);
      return response.books.items;
    },
    enabled: query.length > 1,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: bookKeys.categories(),
    queryFn: async () => {
      const response = await booksApi.getCategories();
      return response.data;
    },
  });
}

export type { SearchBook };
