import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { AnnualReportScreen } from '@/features/annual-report/components/AnnualReportScreen';

export default function AnnualReportPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { year } = useLocalSearchParams<{ year?: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('annualReport.title', { defaultValue: 'Year in Review' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <AnnualReportScreen year={year ? Number(year) : undefined} />
    </>
  );
}
