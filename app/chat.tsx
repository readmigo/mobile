import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { ChatScreen } from '@/features/messaging/components/ChatScreen';

export default function ChatPage() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('messaging.title', { defaultValue: 'Support' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <ChatScreen conversationId={conversationId} />
    </>
  );
}
