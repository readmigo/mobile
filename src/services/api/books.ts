import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description?: string;
  category: string;
  difficulty: number;
  language: string;
  pageCount?: number;
  publishedDate?: string;
  isbn?: string;
  isFree: boolean;
  hasAudiobook: boolean;
}

export interface BookDetail extends Book {
  chapters: Chapter[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  wordCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserBook {
  id: string;
  bookId: string;
  book: Book;
  progress: number;
  currentCfi: string;
  lastReadAt: string;
  isCompleted: boolean;
  addedAt: string;
}

export interface ReadingProgress {
  bookId: string;
  progress: number;
  cfi: string;
  chapterId?: string;
}

export const booksApi = {
  getBooks: async (params?: {
    category?: string;
    difficulty?: number;
    language?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get('/books', { params });
    return response.data;
  },

  getBookDetail: async (bookId: string): Promise<ApiResponse<BookDetail>> => {
    const response = await apiClient.get(`/books/${bookId}`);
    return response.data;
  },

  searchBooks: async (query: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get('/books/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/books/categories');
    return response.data;
  },

  // User Library
  getUserLibrary: async (): Promise<ApiResponse<UserBook[]>> => {
    const response = await apiClient.get('/user/library');
    return response.data;
  },

  addToLibrary: async (bookId: string): Promise<ApiResponse<UserBook>> => {
    const response = await apiClient.post('/user/library', { bookId });
    return response.data;
  },

  removeFromLibrary: async (bookId: string): Promise<void> => {
    await apiClient.delete(`/user/library/${bookId}`);
  },

  updateReadingProgress: async (data: ReadingProgress): Promise<ApiResponse<UserBook>> => {
    const response = await apiClient.put(`/user/library/${data.bookId}/progress`, data);
    return response.data;
  },

  getBookContent: async (bookId: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await apiClient.get(`/books/${bookId}/content`);
    return response.data;
  },
};
