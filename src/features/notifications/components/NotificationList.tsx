import React, { useCallback } from 'react';
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
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { AppNotification } from '@/services/api/notifications';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  system: 'information-circle-outline',
  reading_reminder: 'time-outline',
  new_book: 'book-outline',
  social: 'people-outline',
  achievement: 'trophy-outline',
};

export function NotificationList() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: notifications, isLoading, refetch } = useNotifications({ pageSize: 50 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllRead } = useMarkAllAsRead();

  const handlePress = useCallback(
    (item: AppNotification) => {
      if (!item.isRead) {
        markAsRead(item.id);
      }
      if (item.deepLink) {
        router.push(item.deepLink as any);
      }
    },
    [markAsRead],
  );

  const formatDate = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d`;
  };

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: item.isRead ? colors.background : colors.primary + '08' },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: (item.isRead ? colors.textTertiary : colors.primary) + '15' },
          ]}
        >
          <Ionicons
            name={NOTIFICATION_ICONS[item.type] ?? 'notifications-outline'}
            size={20}
            color={item.isRead ? colors.textTertiary : colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              !item.isRead && { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatDate(item.createdAt)}
          </Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
      </TouchableOpacity>
    ),
    [colors, handlePress],
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {hasUnread && (
        <TouchableOpacity style={styles.markAllBtn} onPress={() => markAllRead()}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>
            {t('notifications.markAllRead', { defaultValue: 'Mark all as read' })}
          </Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={!notifications?.length ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('notifications.empty', { defaultValue: 'No notifications yet' })}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  markAllBtn: { alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 15, marginBottom: 2 },
  body: { fontSize: 13, lineHeight: 18 },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
