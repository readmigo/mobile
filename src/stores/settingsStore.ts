import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type Language = 'en' | 'zh-Hans' | 'zh-Hant';
export type TextAlignment = 'left' | 'justify';

interface SettingsState {
  // App Settings
  themeMode: ThemeMode;
  language: Language;
  notificationsEnabled: boolean;

  // Reader Settings
  readerTheme: ReaderTheme;
  fontSize: number;
  fontFamily: string;
  lineSpacing: number;
  textAlignment: TextAlignment;
  marginHorizontal: number;

  // Learning Settings
  dailyGoal: number;
  reminderTime: string | null;
  autoSaveWords: boolean;

  // Audio Settings
  audioPlaybackSpeed: number;
  audioAutoPlay: boolean;
}

interface SettingsActions {
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setReaderSettings: (settings: Partial<SettingsState>) => void;
  setDailyGoal: (goal: number) => void;
  setReminderTime: (time: string | null) => void;
  toggleNotifications: () => void;
  toggleAutoSaveWords: () => void;
  setAudioPlaybackSpeed: (speed: number) => void;
  toggleAudioAutoPlay: () => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  // App Settings
  themeMode: 'system',
  language: 'en',
  notificationsEnabled: true,

  // Reader Settings
  readerTheme: 'light',
  fontSize: 18,
  fontFamily: 'system',
  lineSpacing: 1.6,
  textAlignment: 'left',
  marginHorizontal: 16,

  // Learning Settings
  dailyGoal: 20,
  reminderTime: null,
  autoSaveWords: true,

  // Audio Settings
  audioPlaybackSpeed: 1.0,
  audioAutoPlay: false,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setLanguage: (lang) => set({ language: lang }),

      setReaderSettings: (settings) => set((state) => ({ ...state, ...settings })),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      setReminderTime: (time) => set({ reminderTime: time }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      toggleAutoSaveWords: () =>
        set((state) => ({ autoSaveWords: !state.autoSaveWords })),

      setAudioPlaybackSpeed: (speed) => set({ audioPlaybackSpeed: speed }),

      toggleAudioAutoPlay: () =>
        set((state) => ({ audioAutoPlay: !state.audioAutoPlay })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
