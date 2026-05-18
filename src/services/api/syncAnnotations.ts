import { apiClient } from './client';
import type { CreateHighlightDto } from './highlights';
import type { CreateBookmarkDto } from './bookmarks';

// Mirrors POST /annotations/sync request/response from the api repo.
// Gated by SubscriptionGuard server-side — non-subscribers receive 403.
export interface SyncAnnotationsRequest {
  highlights?: Array<CreateHighlightDto & { localId: string }>;
  bookmarks?: Array<CreateBookmarkDto & { localId: string }>;
  deletedHighlightIds?: string[];
  deletedBookmarkIds?: string[];
}

export interface SyncAnnotationsResponse {
  createdHighlights: Array<{ localId: string; serverId: string }>;
  createdAnnotations: Array<{ localId: string; serverId: string }>;
  createdBookmarks: Array<{ localId: string; serverId: string }>;
  deletedHighlights: number;
  deletedAnnotations: number;
  deletedBookmarks: number;
}

export const syncAnnotationsApi = {
  sync: async (dto: SyncAnnotationsRequest): Promise<SyncAnnotationsResponse> => {
    const response = await apiClient.post<SyncAnnotationsResponse>('/annotations/sync', dto);
    return response.data;
  },
};
