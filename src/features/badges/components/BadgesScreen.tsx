import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { badgesApi, Badge } from '@/services/api/badges';

function BadgeCard({ badge }: { badge: Badge }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.badgeCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.badgeIcon, { opacity: badge.isUnlocked ? 1 : 0.35 }]}>
        {badge.iconUrl ? (
          <Image source={{ uri: badge.iconUrl }} style={styles.badgeImage} resizeMode="contain" />
        ) : (
          <Ionicons
            name={badge.isUnlocked ? 'trophy' : 'lock-closed-outline'}
            size={32}
            color={badge.isUnlocked ? '#FFB300' : colors.textTertiary}
          />
        )}
      </View>
      <Text
        style={[styles.badgeName, { color: badge.isUnlocked ? colors.text : colors.textTertiary }]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      {badge.isUnlocked ? (
        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
      ) : badge.progress != null ? (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[styles.progressFill, { backgroundColor: colors.primary, width: `${badge.progress * 100}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textTertiary }]}>
            {Math.round(badge.progress * 100)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function BadgesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const NUM_COLUMNS = 3;
  const itemWidth = (width - 48) / NUM_COLUMNS;

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => (await badgesApi.getBadges()).data,
  });

  const filtered = badges?.filter((b) => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'locked') return !b.isUnlocked;
    return true;
  });

  const unlockedCount = badges?.filter((b) => b.isUnlocked).length ?? 0;
  const totalCount = badges?.length ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: Badge }) => (
      <View style={{ width: itemWidth }}>
        <BadgeCard badge={item} />
      </View>
    ),
    [itemWidth],
  );

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'all', label: t('badges.all', { defaultValue: 'All' }) },
    { id: 'unlocked', label: t('badges.unlocked', { defaultValue: 'Unlocked' }) },
    { id: 'locked', label: t('badges.locked', { defaultValue: 'Locked' }) },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <Ionicons name="trophy" size={28} color="#FFB300" />
        <Text style={[styles.summaryText, { color: colors.text }]}>
          {unlockedCount} / {totalCount}
        </Text>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          {t('badges.earned', { defaultValue: 'badges earned' })}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              { backgroundColor: filter === f.id ? colors.primary : colors.surface },
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f.id ? colors.onPrimary : colors.textSecondary }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="ribbon-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('badges.noBadges', { defaultValue: 'No badges yet. Keep reading!' })}
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  summaryText: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  grid: { paddingHorizontal: 16, paddingBottom: 32 },
  badgeCard: { alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12, marginHorizontal: 4 },
  badgeIcon: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeImage: { width: 48, height: 48 },
  badgeName: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  progressContainer: { width: '100%', gap: 2 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 10, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
