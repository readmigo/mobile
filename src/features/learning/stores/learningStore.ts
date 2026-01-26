import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TodayProgress {
  wordsLearned: number;
  wordsReviewed: number;
  readingMinutes: number;
  pagesRead: number;
  lastUpdated: string;
}

interface LearningState {
  // Today's progress (local tracking)
  todayProgress: TodayProgress;

  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;

  // Session tracking
  currentSessionStart: string | null;
  currentBookId: string | null;
}

interface LearningActions {
  // Progress tracking
  incrementWordsLearned: (count?: number) => void;
  incrementWordsReviewed: (count?: number) => void;
  addReadingTime: (minutes: number) => void;
  addPagesRead: (pages: number) => void;

  // Session management
  startReadingSession: (bookId: string) => void;
  endReadingSession: () => { bookId: string; duration: number } | null;

  // Streak management
  updateStreak: (current: number, longest: number, lastDate: string) => void;
  checkAndResetDaily: () => void;

  // Reset
  resetTodayProgress: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialProgress: TodayProgress = {
  wordsLearned: 0,
  wordsReviewed: 0,
  readingMinutes: 0,
  pagesRead: 0,
  lastUpdated: getToday(),
};

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      todayProgress: initialProgress,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      currentSessionStart: null,
      currentBookId: null,

      // Actions
      incrementWordsLearned: (count = 1) =>
        set((state) => {
          state.checkAndResetDaily();
          state.todayProgress.wordsLearned += count;
          state.todayProgress.lastUpdated = getToday();
        }),

      incrementWordsReviewed: (count = 1) =>
        set((state) => {
          state.checkAndResetDaily();
          state.todayProgress.wordsReviewed += count;
          state.todayProgress.lastUpdated = getToday();
        }),

      addReadingTime: (minutes) =>
        set((state) => {
          state.checkAndResetDaily();
          state.todayProgress.readingMinutes += minutes;
          state.todayProgress.lastUpdated = getToday();
        }),

      addPagesRead: (pages) =>
        set((state) => {
          state.checkAndResetDaily();
          state.todayProgress.pagesRead += pages;
          state.todayProgress.lastUpdated = getToday();
        }),

      startReadingSession: (bookId) =>
        set((state) => {
          state.currentSessionStart = new Date().toISOString();
          state.currentBookId = bookId;
        }),

      endReadingSession: () => {
        const state = get();
        if (!state.currentSessionStart || !state.currentBookId) {
          return null;
        }

        const startTime = new Date(state.currentSessionStart).getTime();
        const endTime = Date.now();
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        const bookId = state.currentBookId;

        set((s) => {
          s.currentSessionStart = null;
          s.currentBookId = null;
          if (durationMinutes > 0) {
            s.todayProgress.readingMinutes += durationMinutes;
          }
        });

        return { bookId, duration: durationMinutes };
      },

      updateStreak: (current, longest, lastDate) =>
        set((state) => {
          state.currentStreak = current;
          state.longestStreak = longest;
          state.lastActiveDate = lastDate;
        }),

      checkAndResetDaily: () => {
        const state = get();
        const today = getToday();
        if (state.todayProgress.lastUpdated !== today) {
          set((s) => {
            s.todayProgress = { ...initialProgress, lastUpdated: today };
          });
        }
      },

      resetTodayProgress: () =>
        set((state) => {
          state.todayProgress = { ...initialProgress, lastUpdated: getToday() };
        }),
    })),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
