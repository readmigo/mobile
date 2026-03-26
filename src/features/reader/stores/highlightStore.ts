import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
export type HighlightStyle = 'underline' | 'wavy' | 'background' | 'boldLine';

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; underline: string }> = {
  yellow: { bg: 'rgba(255, 235, 59, 0.3)', underline: '#FDD835' },
  green: { bg: 'rgba(76, 175, 80, 0.3)', underline: '#43A047' },
  blue: { bg: 'rgba(66, 133, 244, 0.3)', underline: '#4285F4' },
  pink: { bg: 'rgba(233, 30, 99, 0.3)', underline: '#E91E63' },
  purple: { bg: 'rgba(156, 39, 176, 0.3)', underline: '#9C27B0' },
  orange: { bg: 'rgba(255, 152, 0, 0.3)', underline: '#FB8C00' },
};

export interface Highlight {
  id: string;
  bookId: string;
  chapterId: string;
  selectedText: string;
  color: HighlightColor;
  style: HighlightStyle;
  paragraphIndex: number;
  charOffset: number;
  charLength: number;
  cfiPath?: string;
  note?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  paragraphIndex: number;
  scrollPercentage: number;
  cfiPath?: string;
  title?: string;
  note?: string;
  createdAt: string;
  syncedAt?: string;
}

interface HighlightState {
  highlights: Record<string, Highlight[]>; // keyed by bookId
  bookmarks: Record<string, Bookmark[]>; // keyed by bookId
  activeColor: HighlightColor;
  activeStyle: HighlightStyle;
}

interface HighlightActions {
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (bookId: string, highlightId: string) => void;
  updateHighlightNote: (bookId: string, highlightId: string, note: string) => void;
  setActiveColor: (color: HighlightColor) => void;
  setActiveStyle: (style: HighlightStyle) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  updateBookmarkNote: (bookId: string, bookmarkId: string, note: string) => void;
  getBookHighlights: (bookId: string) => Highlight[];
  getBookBookmarks: (bookId: string) => Bookmark[];
}

export const useHighlightStore = create<HighlightState & HighlightActions>()(
  persist(
    immer((set, get) => ({
      highlights: {},
      bookmarks: {},
      activeColor: 'yellow',
      activeStyle: 'background',

      addHighlight: (highlight) =>
        set((state) => {
          if (!state.highlights[highlight.bookId]) {
            state.highlights[highlight.bookId] = [];
          }
          state.highlights[highlight.bookId].push(highlight);
        }),

      removeHighlight: (bookId, highlightId) =>
        set((state) => {
          if (state.highlights[bookId]) {
            state.highlights[bookId] = state.highlights[bookId].filter((h) => h.id !== highlightId);
          }
        }),

      updateHighlightNote: (bookId, highlightId, note) =>
        set((state) => {
          const h = state.highlights[bookId]?.find((h) => h.id === highlightId);
          if (h) h.note = note;
        }),

      setActiveColor: (color) => set((state) => { state.activeColor = color; }),
      setActiveStyle: (style) => set((state) => { state.activeStyle = style; }),

      addBookmark: (bookmark) =>
        set((state) => {
          if (!state.bookmarks[bookmark.bookId]) {
            state.bookmarks[bookmark.bookId] = [];
          }
          state.bookmarks[bookmark.bookId].push(bookmark);
        }),

      removeBookmark: (bookId, bookmarkId) =>
        set((state) => {
          if (state.bookmarks[bookId]) {
            state.bookmarks[bookId] = state.bookmarks[bookId].filter((b) => b.id !== bookmarkId);
          }
        }),

      updateBookmarkNote: (bookId, bookmarkId, note) =>
        set((state) => {
          const b = state.bookmarks[bookId]?.find((b) => b.id === bookmarkId);
          if (b) b.note = note;
        }),

      getBookHighlights: (bookId) => get().highlights[bookId] ?? [],
      getBookBookmarks: (bookId) => get().bookmarks[bookId] ?? [],
    })),
    {
      name: 'highlight-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
