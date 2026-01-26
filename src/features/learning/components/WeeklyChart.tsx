import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useWeeklyStats } from '../hooks/useLearningStats';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyChart() {
  const { colors } = useTheme();
  const { data: weeklyStats, isLoading } = useWeeklyStats(0);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // Create data for each day of the week
  const dailyData = DAYS.map((day, index) => {
    const stat = weeklyStats?.dailyStats.find((s) => {
      const date = new Date(s.date);
      return date.getDay() === index;
    });
    return {
      day,
      words: stat?.wordsLearned || 0,
      isToday: new Date().getDay() === index,
    };
  });

  const maxWords = Math.max(...dailyData.map((d) => d.words), 10);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>This Week</Text>

      <View style={styles.chartContainer}>
        {dailyData.map((item, index) => {
          const height = item.words > 0 ? (item.words / maxWords) * 100 : 4;
          return (
            <View key={item.day} style={styles.barContainer}>
              <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                {item.words > 0 ? item.words : ''}
              </Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: item.isToday ? colors.primary : colors.primary + '60',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  { color: item.isToday ? colors.primary : colors.textSecondary },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>

      {weeklyStats && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {weeklyStats.totalWordsLearned}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Words Learned
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {Math.round(weeklyStats.totalReadingTimeMinutes / 60)}h
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Reading Time
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {weeklyStats.averagePerDay}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Daily Avg
            </Text>
          </View>
        </View>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
    height: 14,
  },
  barWrapper: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
  },
});
