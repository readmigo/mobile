import { apiClient } from './client';

// Mirrors BookmarkResponseDto from the api repo (src/modules/annotations/dto/bookmark.dto.ts).
export interface BookmarkDto {
  id: string;
  userId: string;
  userBookId: string;
  chapterId: string;
  cfi?: string;
  scrollPosition?: number;
  pageNumber?: number;
  title?: string;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  userBook?: { bookId: string };
}

export interface CreateBookmarkDto {
  bookId?: string;
  userBookId?: string;
  chapterId: string;
  chapterIndex?: number;
  cfi?: string;
  scrollPosition?: number;
  scrollPercentage?: number;
  pageNumber?: number;
  title?: string;
  excerpt?: string;
}

export const bookmarksApi = {
  getAll: async (): Promise<BookmarkDto[]> => {
    const response = await apiClient.get<BookmarkDto[]>('/bookmarks');
    return response.data;
  },

  getByBook: async (bookId: string): Promise<BookmarkDto[]> => {
    const response = await apiClient.get<BookmarkDto[]>(`/books/${bookId}/bookmarks`);
    return response.data;
  },

  create: async (dto: CreateBookmarkDto): Promise<BookmarkDto> => {
    const response = await apiClient.post<BookmarkDto>('/bookmarks', dto);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/bookmarks/${id}`);
  },
};
