import { useQuery } from '@tanstack/react-query';
import { bookListsApi, BookList } from '@/services/api/bookLists';

export const bookListKeys = {
  all: ['bookLists'] as const,
  lists: () => [...bookListKeys.all, 'list'] as const,
  detail: (id: string) => [...bookListKeys.all, 'detail', id] as const,
};

export function useBookLists() {
  return useQuery({
    queryKey: bookListKeys.lists(),
    queryFn: async () => {
      const response = await bookListsApi.getBookLists({
        withBooks: true,
        bookLimit: 8,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookListDetail(id: string) {
  return useQuery({
    queryKey: bookListKeys.detail(id),
    queryFn: async () => {
      const response = await bookListsApi.getBookListDetail(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export type { BookList };
