import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { messagingApi, Conversation } from '@/services/api/messaging';

function formatRelative(dateStr: string, locale: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(dateStr).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

interface ThreadRowProps {
  conversation: Conversation;
  onPress: () => void;
}

function ThreadRow({ conversation, onPress }: ThreadRowProps) {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const isOpen = conversation.status === 'open';
  const preview =
    conversation.lastMessage?.content ?? conversation.subject ?? '';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isOpen ? '#43A047' : colors.textTertiary },
        ]}
      />

      <View style={styles.rowBody}>
        <View style={styles.titleLine}>
          <Text
            style={[styles.subject, { color: colors.text }]}
            numberOfLines={1}
          >
            {conversation.subject || 'Conversation'}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatRelative(conversation.updatedAt, i18n.language)}
          </Text>
        </View>

        <Text
          style={[styles.preview, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {preview}
        </Text>
      </View>

      {conversation.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.unreadText, { color: colors.onPrimary }]}>
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function MessageListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['messaging', 'conversations'],
    queryFn: async () => (await messagingApi.getConversations()).data,
  });

  const handleRowPress = useCallback((id: string) => {
    router.push({
      pathname: '/chat' as any,
      params: { conversationId: id },
    });
  }, []);

  const handleNew = useCallback(() => {
    router.push('/new-message' as any);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('messaging.title', { defaultValue: 'Messages' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleNew}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !data || data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('messaging.noMessages', { defaultValue: 'No messages yet' })}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('messaging.noMessagesHint', {
              defaultValue: 'Start a new conversation to get help or share feedback',
            })}
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleNew}
          >
            <Ionicons name="add" size={18} color={colors.onPrimary} />
            <Text style={[styles.startButtonText, { color: colors.onPrimary }]}>
              {t('messaging.newMessage', { defaultValue: 'New Message' })}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThreadRow
              conversation={item}
              onPress={() => handleRowPress(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
