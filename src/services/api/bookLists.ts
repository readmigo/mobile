import { apiClient, ApiResponse } from './client';

export type BookListType =
  | 'RANKING'
  | 'EDITORS_PICK'
  | 'COLLECTION'
  | 'UNIVERSITY'
  | 'CELEBRITY'
  | 'ANNUAL_BEST'
  | 'AI_RECOMMENDED'
  | 'PERSONALIZED'
  | 'AI_FEATURED';

export interface BookListBook {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  description?: string;
  coverUrl?: string;
  coverThumbUrl?: string;
  difficultyScore?: number;
  wordCount?: number;
  genres?: string[];
  rating?: number;
  rank?: number;
}

export interface BookList {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  type: BookListType;
  bookCount: number;
  sortOrder: number;
  isActive: boolean;
  books?: BookListBook[];
}

export const bookListsApi = {
  getBookLists: async (params?: {
    withBooks?: boolean;
    bookLimit?: number;
  }): Promise<ApiResponse<BookList[]>> => {
    const response = await apiClient.get('/booklists', { params });
    return response.data;
  },

  getBookListDetail: async (id: string): Promise<ApiResponse<BookList>> => {
    const response = await apiClient.get(`/booklists/${id}`);
    return response.data;
  },
};
