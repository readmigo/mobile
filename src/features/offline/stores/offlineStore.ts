import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'failed';

export interface OfflineBook {
  bookId: string;
  title: string;
  filePath: string;
  fileSize: number;
  downloadedAt: string;
  expiresAt: string; // 30-day TTL
  status: DownloadStatus;
  progress: number; // 0-1
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_CACHE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

interface OfflineState {
  books: Record<string, OfflineBook>;
  downloadQueue: string[]; // bookIds
  maxCacheBytes?: number;
}

interface OfflineActions {
  setBook: (book: OfflineBook) => void;
  removeBook: (bookId: string) => void;
  updateProgress: (bookId: string, progress: number) => void;
  setStatus: (bookId: string, status: DownloadStatus) => void;
  addToQueue: (bookId: string) => void;
  removeFromQueue: (bookId: string) => void;
  getBook: (bookId: string) => OfflineBook | undefined;
  isDownloaded: (bookId: string) => boolean;
  getTotalCacheSize: () => number;
  getMaxCacheBytes: () => number;
  setMaxCacheBytes: (bytes: number) => void;
  /** Evicts oldest completed books until total size is under maxCacheBytes. Returns evicted bookIds so the caller can delete files. */
  enforceLimit: () => string[];
  clearExpired: () => void;
  clearAll: () => void;
}

export const useOfflineStore = create<OfflineState & OfflineActions>()(
  persist(
    immer((set, get) => ({
      books: {},
      downloadQueue: [],
      maxCacheBytes: DEFAULT_MAX_CACHE_BYTES,

      setBook: (book) =>
        set((state) => {
          state.books[book.bookId] = book;
        }),

      removeBook: (bookId) =>
        set((state) => {
          delete state.books[bookId];
          state.downloadQueue = state.downloadQueue.filter((id) => id !== bookId);
        }),

      updateProgress: (bookId, progress) =>
        set((state) => {
          if (state.books[bookId]) {
            state.books[bookId].progress = progress;
          }
        }),

      setStatus: (bookId, status) =>
        set((state) => {
          if (state.books[bookId]) {
            state.books[bookId].status = status;
          }
        }),

      addToQueue: (bookId) =>
        set((state) => {
          if (!state.downloadQueue.includes(bookId)) {
            state.downloadQueue.push(bookId);
          }
        }),

      removeFromQueue: (bookId) =>
        set((state) => {
          state.downloadQueue = state.downloadQueue.filter((id) => id !== bookId);
        }),

      getBook: (bookId) => get().books[bookId],

      isDownloaded: (bookId) => {
        const book = get().books[bookId];
        if (!book || book.status !== 'completed') return false;
        return new Date(book.expiresAt).getTime() > Date.now();
      },

      getTotalCacheSize: () =>
        Object.values(get().books).reduce((sum, b) => sum + (b.fileSize || 0), 0),

      getMaxCacheBytes: () => get().maxCacheBytes ?? DEFAULT_MAX_CACHE_BYTES,

      setMaxCacheBytes: (bytes) =>
        set((state) => {
          state.maxCacheBytes = bytes;
        }),

      enforceLimit: () => {
        const limit = get().maxCacheBytes ?? DEFAULT_MAX_CACHE_BYTES;
        const completed = Object.values(get().books)
          .filter((b) => b.status === 'completed')
          .sort((a, b) => new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime());
        let total = completed.reduce((sum, b) => sum + (b.fileSize || 0), 0);
        const evicted: string[] = [];
        for (const book of completed) {
          if (total <= limit) break;
          evicted.push(book.bookId);
          total -= book.fileSize || 0;
        }
        if (evicted.length > 0) {
          set((state) => {
            for (const id of evicted) {
              delete state.books[id];
              state.downloadQueue = state.downloadQueue.filter((q) => q !== id);
            }
          });
        }
        return evicted;
      },

      clearExpired: () =>
        set((state) => {
          const now = Date.now();
          for (const [bookId, book] of Object.entries(state.books)) {
            if (new Date(book.expiresAt).getTime() < now) {
              delete state.books[bookId];
            }
          }
        }),

      clearAll: () =>
        set((state) => {
          state.books = {};
          state.downloadQueue = [];
        }),
    })),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { DEFAULT_MAX_CACHE_BYTES, THIRTY_DAYS_MS };
