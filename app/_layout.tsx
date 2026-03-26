import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { queryClient } from '@/services/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { initSentry, setUser as setSentryUser, clearUser as clearSentryUser, Sentry } from '@/services/crashTracking';
import { initAnalytics, identifyUser, resetUser, setSuperProperties, registerSuperProperties } from '@/services/analytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Initialize Sentry early
initSentry();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { navigationTheme, isDark } = useTheme();
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialize analytics
  useEffect(() => {
    initAnalytics().then(() => {
      setSuperProperties();
    });
  }, []);

  // Sync user with Sentry & PostHog
  useEffect(() => {
    if (isAuthenticated && user) {
      setSentryUser(user.id, user.displayName);
      identifyUser(user.id, {
        subscription_tier: user.subscriptionTier,
        display_name: user.displayName,
      });
      registerSuperProperties({
        subscription_tier: user.subscriptionTier,
      });
    } else {
      clearSentryUser();
      resetUser();
    }
  }, [isAuthenticated, user]);

  // Safety timeout: force hide splash if rehydration takes too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isLoading) {
        useAuthStore.setState({ isLoading: false });
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={navigationTheme}>
            <BottomSheetModalProvider>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="book/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="book/reader"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="category/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="book-list/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="author/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="audiobook-player"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                  headerShown: false,
                }}
              />
            </Stack>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutInner />
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
