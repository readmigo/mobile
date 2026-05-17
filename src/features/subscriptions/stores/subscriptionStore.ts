import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier, SubscriptionInfo } from '../services/revenueCat';

interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productId: string | null;
  isLoading: boolean;
  lastChecked: string | null;
}

interface SubscriptionActions {
  setSubscriptionInfo: (info: SubscriptionInfo) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: SubscriptionState = {
  tier: 'free',
  isActive: false,
  expirationDate: null,
  willRenew: false,
  productId: null,
  isLoading: true,
  lastChecked: null,
};

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSubscriptionInfo: (info) => {
        set({
          tier: info.tier,
          isActive: info.isActive,
          expirationDate: info.expirationDate,
          willRenew: info.willRenew,
          productId: info.productId,
          isLoading: false,
          lastChecked: new Date().toISOString(),
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => set(initialState),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        isActive: state.isActive,
        expirationDate: state.expirationDate,
        lastChecked: state.lastChecked,
      }),
    }
  )
);

// Feature flags based on subscription tier
export const useSubscriptionFeatures = () => {
  const { tier, isActive } = useSubscriptionStore();
  const isPro = tier === 'pro' && isActive;

  return {
    canAccessLibrary: true,
    canReadBooks: true,
    maxBooksInLibrary: isPro ? Infinity : 3,

    canUseAI: isPro,
    canSaveVocabulary: isPro,
    canUseFlashcards: isPro,
    canListenAudiobooks: isPro,
    hasUnlimitedBooks: isPro,
    canAccessPremiumContent: isPro,
    hasOfflineMode: isPro,
    hasPrioritySupport: isPro,

    isPro,
    /** @deprecated use isPro */
    isPremium: isPro,
  };
};
