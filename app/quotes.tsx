import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { QuotesScreen } from '@/features/quotes/components/QuotesScreen';

export default function QuotesPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('quotes.title', { defaultValue: 'Quotes' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <QuotesScreen />
    </>
  );
}
