import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type Language =
  | 'en' | 'zh-Hans' | 'zh-Hant' | 'de'
  | 'es' | 'fr' | 'ja' | 'ko' | 'ar' | 'pt'
  | 'ru' | 'tr' | 'id' | 'uk' | 'hi';
export type TextAlignment = 'left' | 'center' | 'right' | 'justified';

export const AVAILABLE_FONTS = [
  { id: 'system', name: 'System', category: 'sans-serif' },
  { id: 'system-serif', name: 'System Serif', category: 'serif' },
  { id: 'Georgia', name: 'Georgia', category: 'serif' },
  { id: 'Palatino', name: 'Palatino', category: 'serif' },
  { id: 'Times New Roman', name: 'Times New Roman', category: 'serif' },
  { id: 'Baskerville', name: 'Baskerville', category: 'serif' },
  { id: 'Helvetica Neue', name: 'Helvetica Neue', category: 'sans-serif' },
  { id: 'Avenir', name: 'Avenir', category: 'sans-serif' },
  { id: 'Literata', name: 'Literata', category: 'serif' },
  { id: 'Source Serif 4', name: 'Source Serif 4', category: 'serif' },
  { id: 'Crimson Pro', name: 'Crimson Pro', category: 'serif' },
  { id: 'IBM Plex Serif', name: 'IBM Plex Serif', category: 'serif' },
  { id: 'Bitter', name: 'Bitter', category: 'serif' },
  { id: 'Atkinson Hyperlegible', name: 'Atkinson Hyperlegible', category: 'sans-serif' },
  { id: 'OpenDyslexic', name: 'OpenDyslexic', category: 'sans-serif' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'monospace' },
  { id: 'PingFang SC', name: '苹方', category: 'chinese' },
  { id: 'Songti SC', name: '宋体', category: 'chinese' },
  { id: 'Kaiti SC', name: '楷体', category: 'chinese' },
] as const;

export const READER_THEME_COLORS = {
  light: { background: '#FFFFFF', text: '#1A1A1A', secondary: '#666666', link: '#4285F4' },
  sepia: { background: '#FAF2E3', text: '#4D3319', secondary: '#7A6652', link: '#3B6BA5' },
  dark: { background: '#1F1F1F', text: '#D9D9D9', secondary: '#999999', link: '#6BA3F7' },
} as const;

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

  // Extended Reader Settings
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  fontWeight: 300 | 400 | 500 | 600 | 700;
  hyphenation: boolean;

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

  // Extended Reader Settings
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 12,
  fontWeight: 400,
  hyphenation: false,

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

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      setLanguage: (lang) => {
        set({ language: lang });
      },

      setReaderSettings: (settings) => set((state) => ({ ...state, ...settings })),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      setReminderTime: (time) => set({ reminderTime: time }),

      toggleNotifications: () =>
        set((state) => {
          return { notificationsEnabled: !state.notificationsEnabled };
        }),

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
