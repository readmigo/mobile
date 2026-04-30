import { apiClient } from './client';

export interface Series {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  authorId?: string;
  authorName?: string;
  bookCount: number;
}

export interface SeriesBook {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  coverThumbUrl?: string;
  seriesPosition?: number;
  difficultyScore?: number;
  wordCount?: number;
  hasAudiobook?: boolean;
  goodreadsRating?: number;
}

export interface SeriesDetail {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  authorId?: string;
  authorName?: string;
  bookCount: number;
  books: SeriesBook[];
}

export interface SeriesListResponse {
  items: Series[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const seriesApi = {
  getSeriesList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    authorId?: string;
  }): Promise<SeriesListResponse> => {
    const response = await apiClient.get('/series', { params });
    return response.data;
  },

  getSeriesDetail: async (id: string): Promise<SeriesDetail> => {
    const response = await apiClient.get(`/series/${id}`);
    return response.data;
  },
};
