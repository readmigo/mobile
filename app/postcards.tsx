import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { PostcardsScreen } from '@/features/postcards/components/PostcardsScreen';

export default function PostcardsPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('postcards.title', { defaultValue: 'Postcards' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <PostcardsScreen />
    </>
  );
}
