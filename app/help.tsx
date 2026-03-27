import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { HelpScreen } from '@/features/help/components/HelpScreen';

export default function HelpPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('help.title', { defaultValue: 'Help Center' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <HelpScreen />
    </>
  );
}
