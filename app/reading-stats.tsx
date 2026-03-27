import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { ReadingStatsScreen } from '@/features/analytics';

export default function ReadingStatsPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('stats.title', { defaultValue: 'Reading Stats' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ReadingStatsScreen />
    </>
  );
}
