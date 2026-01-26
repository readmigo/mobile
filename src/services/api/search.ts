import { apiClient, ApiResponse } from './client';

export interface SearchAuthor {
  id: string;
  name: string;
  nameZh?: string;
  avatarUrl?: string;
  era?: string;
  bookCount: number;
  followerCount: number;
}

export interface SearchBook {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  difficultyScore?: number;
}

export interface SearchQuote {
  id: string;
  text: string;
  textZh?: string;
  source?: string;
  authorName: string;
  authorId?: string;
}

export interface SearchResultSection<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface UnifiedSearchResponse {
  query: string;
  authors: SearchResultSection<SearchAuthor>;
  books: SearchResultSection<SearchBook>;
  quotes: SearchResultSection<SearchQuote>;
}

export interface SearchSuggestion {
  text: string;
  type: 'author' | 'book' | 'popular';
  icon: string;
}

export const searchApi = {
  search: async (query: string, limit?: number): Promise<UnifiedSearchResponse> => {
    const response = await apiClient.get('/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  getSuggestions: async (query: string, limit?: number): Promise<SearchSuggestion[]> => {
    const response = await apiClient.get('/search/suggestions', {
      params: { q: query, limit },
    });
    return response.data;
  },

  getPopularSearches: async (limit?: number): Promise<{ term: string; count: number }[]> => {
    const response = await apiClient.get('/search/popular', {
      params: { limit },
    });
    return response.data;
  },

  getTrendingSearches: async (limit?: number): Promise<{ term: string; count: number }[]> => {
    const response = await apiClient.get('/search/trending', {
      params: { limit },
    });
    return response.data;
  },
};
