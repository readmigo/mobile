import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTodayStats, useGoalProgress } from '../hooks/useLearningStats';
import { useSettingsStore } from '@/stores/settingsStore';

export function StatsOverview() {
  const { colors } = useTheme();
  const { dailyGoal } = useSettingsStore();
  const { data: stats, isLoading: statsLoading } = useTodayStats();
  const { data: goalProgress, isLoading: goalLoading } = useGoalProgress();

  const isLoading = statsLoading || goalLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const progress = goalProgress?.percentComplete || 0;
  const wordsLearned = stats?.today.wordsLearned || 0;
  const streak = stats?.streak.current || 0;
  const totalWords = stats?.totalWords || 0;
  const reviewDue = stats?.reviewDueToday || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <View style={styles.progressCircle}>
          <View
            style={[
              styles.progressCircleInner,
              {
                borderColor: progress >= 100 ? colors.success : colors.primary,
                borderWidth: 6,
              },
            ]}
          >
            <Text style={[styles.progressNumber, { color: colors.primary }]}>
              {wordsLearned}
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              / {dailyGoal} words
            </Text>
          </View>
        </View>

        {progress >= 100 && (
          <View style={[styles.completeBadge, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.completeText, { color: colors.success }]}>Goal Complete!</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="flame" size={20} color={colors.warning} />
          </View>
          <Text style={[styles.statNumber, { color: colors.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statNumber, { color: colors.text }]}>{totalWords}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Words</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="refresh" size={20} color={colors.info} />
          </View>
          <Text style={[styles.statNumber, { color: colors.text }]}>{reviewDue}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Due Today</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    alignItems: 'center',
  },
  progressCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
