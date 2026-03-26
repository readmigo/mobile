import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { secureStorage } from './secureStorage';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium';
  createdAt?: string;
  englishLevel?: EnglishLevel;
  interests?: string[];
  dailyGoalMinutes?: number;
}

export type EnglishLevel = 'beginner' | 'elementary' | 'intermediate' | 'upperIntermediate' | 'advanced';

export const DIFFICULTY_RANGES: Record<EnglishLevel, { min: number; max: number }> = {
  beginner: { min: 1, max: 3 },
  elementary: { min: 2, max: 4 },
  intermediate: { min: 3, max: 6 },
  upperIntermediate: { min: 5, max: 8 },
  advanced: { min: 7, max: 10 },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuestMode: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isGuestMode: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      ...initialState,

      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          state.isGuestMode = false;
          state.isLoading = false;
        }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.isGuestMode = false;
          state.isLoading = false;
        }),

      enterGuestMode: () =>
        set((state) => {
          state.isGuestMode = true;
          state.isAuthenticated = false;
          state.isLoading = false;
        }),

      exitGuestMode: () =>
        set((state) => {
          state.isGuestMode = false;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates };
          }
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isGuestMode: state.isGuestMode,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Always set loading to false, whether rehydration succeeds or fails
        if (state) {
          state.isLoading = false;
        } else {
          useAuthStore.setState({ isLoading: false });
        }
      },
    }
  )
);
