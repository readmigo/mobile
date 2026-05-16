import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchasesPackage } from 'react-native-purchases';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getSubscriptionInfo,
  initializeRevenueCat,
  loginUser,
  logoutUser,
  addCustomerInfoUpdateListener,
  SubscriptionPackage,
} from '../services/revenueCat';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { handleApiError } from '@/services/api/errors';
import { notifyError } from '@/services/toast';
import { trackSubscriptionPurchased } from '@/services/analytics';

function onMutationError(err: unknown) {
  const appError = handleApiError(err);
  if (appError.isUserActionable) notifyError(appError);
}

export const subscriptionKeys = {
  all: ['subscription'] as const,
  info: () => [...subscriptionKeys.all, 'info'] as const,
  offerings: () => [...subscriptionKeys.all, 'offerings'] as const,
};

export function useInitializeSubscription() {
  const { user, isAuthenticated } = useAuthStore();
  const { setSubscriptionInfo, setLoading } = useSubscriptionStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await initializeRevenueCat(user?.id);

        if (isAuthenticated && user?.id) {
          await loginUser(user.id);
        }

        const info = await getSubscriptionInfo();
        setSubscriptionInfo(info);

        // Listen for subscription updates
        addCustomerInfoUpdateListener(async () => {
          const updatedInfo = await getSubscriptionInfo();
          setSubscriptionInfo(updatedInfo);
        });
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user?.id, isAuthenticated]);
}

export function useSubscriptionInfo() {
  const { setSubscriptionInfo } = useSubscriptionStore();

  return useQuery({
    queryKey: subscriptionKeys.info(),
    queryFn: async () => {
      const info = await getSubscriptionInfo();
      setSubscriptionInfo(info);
      return info;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOfferings() {
  return useQuery({
    queryKey: subscriptionKeys.offerings(),
    queryFn: getOfferings,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePurchase() {
  const queryClient = useQueryClient();
  const { setSubscriptionInfo } = useSubscriptionStore();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      const customerInfo = await purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: async (_result, pkg) => {
      trackSubscriptionPurchased({
        productId: pkg?.product?.identifier ?? pkg?.identifier ?? '',
        source: 'paywall',
      });
      const info = await getSubscriptionInfo();
      setSubscriptionInfo(info);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.info() });
    },
    onError: onMutationError,
  });
}

export function useRestorePurchases() {
  const queryClient = useQueryClient();
  const { setSubscriptionInfo } = useSubscriptionStore();

  return useMutation({
    mutationFn: restorePurchases,
    onSuccess: async () => {
      const info = await getSubscriptionInfo();
      setSubscriptionInfo(info);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.info() });
    },
    onError: onMutationError,
  });
}

export function useLogoutSubscription() {
  const { reset } = useSubscriptionStore();

  return useCallback(async () => {
    await logoutUser();
    reset();
  }, [reset]);
}
