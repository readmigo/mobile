import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';
import { identifyUser, resetAmplitude } from '@/services/amplitude';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium';
  createdAt?: string;
}

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

          const locale = Localization.getLocales()[0];
          identifyUser(user.id, {
            email: user.email,
            subscription_tier: user.subscriptionTier,
            registration_date: user.createdAt ?? null,
            country: locale?.regionCode ?? null,
            language: locale?.languageCode ?? null,
            platform: Platform.OS,
            app_version: Constants.expoConfig?.version ?? null,
            device_model: Device.modelName ?? null,
            os_version: String(Platform.Version),
            last_active_date: new Date().toISOString(),
          });
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
          resetAmplitude();
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
