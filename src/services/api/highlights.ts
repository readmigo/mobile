import { apiClient } from './client';

// Mirrors HighlightResponseDto from the api repo (src/modules/annotations/dto/highlight.dto.ts).
// Server returns raw shape, no `{ success, data }` wrapper.
export interface HighlightDto {
  id: string;
  userId: string;
  userBookId: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  cfiRange?: string;
  selectedText: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  paragraphIndex?: number;
  charOffset?: number;
  charLength?: number;
  style: string; // 'underline' | 'wavy' | 'background' | 'bold_line'
  /** Backend joins UserBook → Book; included on list/detail endpoints. */
  userBook?: { bookId: string };
}

export interface CreateHighlightDto {
  bookId?: string;
  userBookId?: string;
  chapterId: string;
  startOffset?: number;
  endOffset?: number;
  chapterIndex?: number;
  scrollPercentage?: number;
  cfiRange?: string;
  cfiPath?: string;
  selectedText: string;
  paragraphIndex?: number;
  charOffset?: number;
  charLength?: number;
  color: string;
  style?: string; // server expects bold_line not boldLine
}

export interface UpdateHighlightDto {
  color?: string;
  startOffset?: number;
  endOffset?: number;
  cfiRange?: string;
  selectedText?: string;
  paragraphIndex?: number;
  charOffset?: number;
  charLength?: number;
  style?: string;
}

export const highlightsApi = {
  getAll: async (): Promise<HighlightDto[]> => {
    const response = await apiClient.get<HighlightDto[]>('/highlights');
    return response.data;
  },

  getByBook: async (bookId: string): Promise<HighlightDto[]> => {
    const response = await apiClient.get<HighlightDto[]>(`/books/${bookId}/highlights`);
    return response.data;
  },

  create: async (dto: CreateHighlightDto): Promise<HighlightDto> => {
    const response = await apiClient.post<HighlightDto>('/highlights', dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateHighlightDto): Promise<HighlightDto> => {
    const response = await apiClient.patch<HighlightDto>(`/highlights/${id}`, dto);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/highlights/${id}`);
  },
};
