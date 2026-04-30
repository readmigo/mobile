import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { isAuthenticated, isGuestMode } = useAuthStore();

  if (isAuthenticated || isGuestMode) {
    return <Redirect href={'/(tabs)/bookshelf' as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
