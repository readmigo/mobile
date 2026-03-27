import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useReadingStats, useWeeklyTrend } from '../hooks/useReadingStats';
import type { DailyReading } from '@/services/api/stats';

// --- Stat Card ---

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}

function StatCard({ icon, label, value, subtitle, color }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </View>
  );
}

// --- Streak Badge ---

function StreakBadge({ streak, longest }: { streak: number; longest: number }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.streakContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.streakContent}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View>
          <Text style={[styles.streakValue, { color: colors.text }]}>
            {streak} {t('stats.days', { defaultValue: 'days' })}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            {t('stats.currentStreak', { defaultValue: 'Current Streak' })}
          </Text>
        </View>
      </View>
      <Text style={[styles.longestStreak, { color: colors.textTertiary }]}>
        {t('stats.longest', { defaultValue: 'Longest' })}: {longest} {t('stats.days', { defaultValue: 'days' })}
      </Text>
    </View>
  );
}

// --- Weekly Chart ---

function WeeklyChart({ days }: { days: DailyReading[] }) {
  const { colors } = useTheme();
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  const dayLabels = days.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
  });

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>This Week</Text>
      <View style={styles.chartBars}>
        {days.map((day, i) => {
          const height = Math.max((day.minutes / maxMinutes) * 100, 4);
          const isToday = i === days.length - 1;
          return (
            <View key={day.date} style={styles.chartBarWrapper}>
              <View style={styles.chartBarColumn}>
                <Text style={[styles.chartBarValue, { color: colors.textTertiary }]}>
                  {day.minutes > 0 ? `${day.minutes}m` : ''}
                </Text>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height,
                      backgroundColor: isToday ? colors.primary : colors.primary + '60',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.chartBarLabel,
                  { color: isToday ? colors.primary : colors.textTertiary },
                  isToday && { fontWeight: '700' },
                ]}
              >
                {dayLabels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// --- Main Screen ---

export function ReadingStatsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: stats, isLoading, refetch } = useReadingStats();
  const { data: weekly } = useWeeklyTrend();

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={colors.primary} />
      }
    >
      {/* Streak */}
      {stats && (
        <StreakBadge streak={stats.currentStreak} longest={stats.longestStreak} />
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="time-outline"
          label={t('stats.today', { defaultValue: 'Today' })}
          value={formatMinutes(stats?.todayMinutes ?? 0)}
          color="#4CAF50"
        />
        <StatCard
          icon="calendar-outline"
          label={t('stats.thisWeek', { defaultValue: 'This Week' })}
          value={formatMinutes(stats?.weekMinutes ?? 0)}
          color="#2196F3"
        />
        <StatCard
          icon="trending-up-outline"
          label={t('stats.thisMonth', { defaultValue: 'This Month' })}
          value={formatMinutes(stats?.monthMinutes ?? 0)}
          color="#FF9800"
        />
        <StatCard
          icon="library-outline"
          label={t('stats.totalTime', { defaultValue: 'Total' })}
          value={formatMinutes(stats?.totalMinutes ?? 0)}
          color="#9C27B0"
        />
      </View>

      {/* Weekly Trend */}
      {weekly?.days && weekly.days.length > 0 && <WeeklyChart days={weekly.days} />}

      {/* Vocabulary & Books */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="book-outline"
          label={t('stats.booksCompleted', { defaultValue: 'Books Done' })}
          value={String(stats?.booksCompleted ?? 0)}
          color="#E91E63"
        />
        <StatCard
          icon="school-outline"
          label={t('stats.vocabulary', { defaultValue: 'Vocabulary' })}
          value={String(stats?.vocabularyCount ?? 0)}
          subtitle={stats?.vocabularyReviewPending
            ? `${stats.vocabularyReviewPending} ${t('stats.toReview', { defaultValue: 'to review' })}`
            : undefined}
          color="#00BCD4"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Streak
  streakContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 13,
  },
  longestStreak: {
    fontSize: 12,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  // Chart
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});
