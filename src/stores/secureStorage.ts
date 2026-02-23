import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

/**
 * Zustand StateStorage adapter backed by expo-secure-store.
 *
 * expo-secure-store uses the iOS Keychain (Keychain Services) on iOS and
 * Android Keystore on Android, both of which provide hardware-backed
 * encryption. This prevents auth tokens from being read in plaintext on
 * rooted or jailbroken devices, unlike AsyncStorage which stores data
 * in unencrypted SQLite / flat files.
 *
 * Limitation: expo-secure-store values are limited to 2048 bytes on iOS.
 * The auth store's persisted payload (user object + two JWT tokens) is
 * well within that limit in practice.
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};
