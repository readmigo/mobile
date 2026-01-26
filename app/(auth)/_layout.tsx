import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated, isGuestMode } = useAuthStore();

  // Already authenticated or in guest mode, redirect to main app
  if (isAuthenticated || isGuestMode) {
    return <Redirect href="/(tabs)/library" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
