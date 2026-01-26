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
    (set) => ({
      ...initialState,

      setSubscriptionInfo: (info) =>
        set({
          tier: info.tier,
          isActive: info.isActive,
          expirationDate: info.expirationDate,
          willRenew: info.willRenew,
          productId: info.productId,
          isLoading: false,
          lastChecked: new Date().toISOString(),
        }),

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

  return {
    // Free tier features
    canAccessLibrary: true,
    canReadBooks: true,
    maxBooksInLibrary: tier === 'free' ? 3 : Infinity,

    // Premium features
    canUseAI: tier !== 'free' && isActive,
    canSaveVocabulary: tier !== 'free' && isActive,
    canUseFlashcards: tier !== 'free' && isActive,
    canListenAudiobooks: tier !== 'free' && isActive,
    hasUnlimitedBooks: tier !== 'free' && isActive,

    // Premium Plus features
    canAccessPremiumContent: tier === 'premium_plus' && isActive,
    hasOfflineMode: tier === 'premium_plus' && isActive,
    hasPrioritySupport: tier === 'premium_plus' && isActive,

    // Computed
    isPremium: tier !== 'free' && isActive,
    isPremiumPlus: tier === 'premium_plus' && isActive,
  };
};
