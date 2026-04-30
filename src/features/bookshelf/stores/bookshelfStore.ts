import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BookshelfDisplayMode = 'shelf' | 'list';

export type BookshelfSortOption =
  | 'manual'
  | 'recent'
  | 'title'
  | 'author'
  | 'addedDate';

interface BookshelfState {
  displayMode: BookshelfDisplayMode;
  sortOption: BookshelfSortOption;
  manualOrder: string[];
}

interface BookshelfActions {
  setDisplayMode: (mode: BookshelfDisplayMode) => void;
  toggleDisplayMode: () => void;
  setSortOption: (option: BookshelfSortOption) => void;
  setManualOrder: (bookIds: string[]) => void;
}

const defaults: BookshelfState = {
  displayMode: 'shelf',
  sortOption: 'recent',
  manualOrder: [],
};

export const useBookshelfStore = create<BookshelfState & BookshelfActions>()(
  persist(
    (set) => ({
      ...defaults,

      setDisplayMode: (mode) => set({ displayMode: mode }),

      toggleDisplayMode: () =>
        set((state) => ({
          displayMode: state.displayMode === 'shelf' ? 'list' : 'shelf',
        })),

      setSortOption: (option) => set({ sortOption: option }),

      setManualOrder: (bookIds) => set({ manualOrder: bookIds }),
    }),
    {
      name: 'bookshelf-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
