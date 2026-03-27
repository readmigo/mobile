import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { OfflineManager } from '@/features/offline/components/OfflineManager';

export default function OfflineManagerPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('offline.title', { defaultValue: 'Downloads' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <OfflineManager />
    </>
  );
}
