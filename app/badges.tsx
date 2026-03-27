import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { BadgesScreen } from '@/features/badges/components/BadgesScreen';

export default function BadgesPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('badges.title', { defaultValue: 'Achievements' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <BadgesScreen />
    </>
  );
}
