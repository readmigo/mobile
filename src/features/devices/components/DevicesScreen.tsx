import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { devicesApi, UserDevice } from '@/services/api/devices';

const PLATFORM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  ios: 'phone-portrait-outline',
  android: 'phone-portrait-outline',
  web: 'laptop-outline',
};

export function DevicesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => (await devicesApi.getDevices()).data,
  });

  const { mutate: removeDevice } = useMutation({
    mutationFn: (id: string) => devicesApi.removeDevice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const handleRemove = useCallback(
    (device: UserDevice) => {
      if (device.isCurrent) return;
      Alert.alert(
        t('devices.removeTitle', { defaultValue: 'Remove Device' }),
        t('devices.removeConfirm', { defaultValue: `Remove "${device.name}" from your account?` }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete', { defaultValue: 'Remove' }),
            style: 'destructive',
            onPress: () => removeDevice(device.id),
          },
        ],
      );
    },
    [removeDevice, t],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 5) return t('devices.justNow', { defaultValue: 'Just now' });
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  const renderItem = useCallback(
    ({ item }: { item: UserDevice }) => (
      <View style={[styles.deviceItem, { backgroundColor: colors.surface }]}>
        <View style={[styles.deviceIcon, { backgroundColor: (item.isCurrent ? colors.primary : colors.textTertiary) + '15' }]}>
          <Ionicons
            name={PLATFORM_ICONS[item.platform] ?? 'hardware-chip-outline'}
            size={24}
            color={item.isCurrent ? colors.primary : colors.textTertiary}
          />
        </View>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceNameRow}>
            <Text style={[styles.deviceName, { color: colors.text }]}>{item.name}</Text>
            {item.isCurrent && (
              <View style={[styles.currentBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.currentBadgeText, { color: colors.primary }]}>
                  {t('devices.current', { defaultValue: 'This device' })}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.deviceMeta, { color: colors.textTertiary }]}>
            {item.model ? `${item.model} · ` : ''}{item.platform.toUpperCase()} · {formatDate(item.lastActiveAt)}
          </Text>
        </View>
        {!item.isCurrent && (
          <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    ),
    [colors, handleRemove],
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          {t('devices.headerInfo', { defaultValue: 'Manage devices signed in to your account' })}
        </Text>
      </View>

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="phone-portrait-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('devices.noDevices', { defaultValue: 'No devices found' })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 14,
    borderRadius: 12,
  },
  headerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  list: { paddingHorizontal: 16, gap: 8 },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  deviceName: { fontSize: 15, fontWeight: '600' },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  currentBadgeText: { fontSize: 11, fontWeight: '600' },
  deviceMeta: { fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
