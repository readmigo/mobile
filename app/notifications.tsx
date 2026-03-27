import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { NotificationList } from '@/features/notifications/components/NotificationList';

export default function NotificationsPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('notifications.title', { defaultValue: 'Notifications' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <NotificationList />
    </>
  );
}
