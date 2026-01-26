import { apiClient, ApiResponse } from '@/services/api/client';
import type {
  Audiobook,
  AudiobookListItem,
  AudiobookProgress,
  PlaybackSpeed,
} from '../types';

export interface AudiobooksQueryParams {
  page?: number;
  limit?: number;
  bookId?: string;
  hasBookSync?: boolean;
  language?: string;
  search?: string;
  sortBy?: 'title' | 'author' | 'duration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AudiobooksResponse {
  data: AudiobookListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateProgressRequest {
  chapterIndex: number;
  positionSeconds: number;
  playbackSpeed?: PlaybackSpeed;
}

export const audiobookApi = {
  // Get audiobook list
  getAudiobooks: (params?: AudiobooksQueryParams) =>
    apiClient.get<ApiResponse<AudiobooksResponse>>('/audiobooks', { params }),

  // Get audiobook by ID
  getAudiobook: (id: string) =>
    apiClient.get<ApiResponse<Audiobook>>(`/audiobooks/${id}`),

  // Get audiobook for a specific book
  getAudiobookForBook: (bookId: string) =>
    apiClient.get<ApiResponse<Audiobook>>(`/audiobooks/book/${bookId}`),

  // Get user's audiobook progress
  getProgress: (audiobookId: string) =>
    apiClient.get<ApiResponse<AudiobookProgress>>(`/audiobooks/${audiobookId}/progress`),

  // Update audiobook progress
  updateProgress: (audiobookId: string, data: UpdateProgressRequest) =>
    apiClient.post<ApiResponse<void>>(`/audiobooks/${audiobookId}/progress`, data),

  // Get recently played audiobooks
  getRecentlyPlayed: (limit?: number) =>
    apiClient.get<ApiResponse<AudiobookListItem[]>>('/audiobooks/recently-played', {
      params: { limit },
    }),

  // Search audiobooks
  searchAudiobooks: (query: string, limit?: number) =>
    apiClient.get<ApiResponse<AudiobookListItem[]>>('/audiobooks/search', {
      params: { q: query, limit },
    }),
};
