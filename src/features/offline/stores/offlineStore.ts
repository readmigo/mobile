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

interface OfflineState {
  books: Record<string, OfflineBook>;
  downloadQueue: string[]; // bookIds
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
  clearExpired: () => void;
  clearAll: () => void;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useOfflineStore = create<OfflineState & OfflineActions>()(
  persist(
    immer((set, get) => ({
      books: {},
      downloadQueue: [],

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
