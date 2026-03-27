import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { annualReportApi, AnnualReport } from '@/services/api/annualReport';

function StatPage({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

export function AnnualReportScreen({ year }: { year?: number }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const reportYear = year ?? new Date().getFullYear() - 1;

  const { data: report, isLoading } = useQuery({
    queryKey: ['annual-report', reportYear],
    queryFn: async () => (await annualReportApi.getReport(reportYear)).data,
  });

  const handleShare = async () => {
    if (!report) return;
    await Share.share({
      message: t('annualReport.shareText', {
        defaultValue: `My ${reportYear} reading: ${report.totalBooksRead} books, ${formatMinutes(report.totalMinutesRead)} reading time, ${report.totalWordsLearned} words learned! 📚`,
        year: reportYear,
        books: report.totalBooksRead,
        time: formatMinutes(report.totalMinutesRead),
        words: report.totalWordsLearned,
      }),
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Ionicons name="calendar-outline" size={56} color={colors.textTertiary} />
        <Text style={[styles.noReport, { color: colors.textSecondary }]}>
          {t('annualReport.noData', { defaultValue: 'No report available for this year' })}
        </Text>
      </View>
    );
  }

  const pages = [
    { emoji: '📚', value: String(report.totalBooksRead), label: t('annualReport.booksRead', { defaultValue: 'Books Read' }) },
    { emoji: '⏱️', value: formatMinutes(report.totalMinutesRead), label: t('annualReport.timeSpent', { defaultValue: 'Time Reading' }) },
    { emoji: '📝', value: String(report.totalWordsLearned), label: t('annualReport.wordsLearned', { defaultValue: 'Words Learned' }) },
    { emoji: '🔥', value: `${report.longestStreak} days`, label: t('annualReport.longestStreak', { defaultValue: 'Longest Streak' }) },
    { emoji: '🏆', value: report.readingRank, label: t('annualReport.rank', { defaultValue: 'Your Rank' }) },
    { emoji: '❤️', value: report.favoriteGenre, label: t('annualReport.favoriteGenre', { defaultValue: 'Favorite Genre' }) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PagerView style={styles.pager} initialPage={0}>
        {/* Title page */}
        <View key="title" style={[styles.page, { backgroundColor: colors.background }]}>
          <Text style={styles.yearEmoji}>🎉</Text>
          <Text style={[styles.yearTitle, { color: colors.primary }]}>{reportYear}</Text>
          <Text style={[styles.yearSubtitle, { color: colors.text }]}>
            {t('annualReport.title', { defaultValue: 'Year in Review' })}
          </Text>
          <Text style={[styles.swipeHint, { color: colors.textTertiary }]}>
            {t('annualReport.swipe', { defaultValue: 'Swipe to explore →' })}
          </Text>
        </View>

        {/* Stat pages */}
        {pages.map((p, i) => (
          <View key={i}>
            <StatPage {...p} />
          </View>
        ))}

        {/* Share page */}
        <View key="share" style={[styles.page, { backgroundColor: colors.background }]}>
          <Text style={styles.yearEmoji}>🌟</Text>
          <Text style={[styles.shareTitle, { color: colors.text }]}>
            {t('annualReport.amazing', { defaultValue: 'Amazing year!' })}
          </Text>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.onPrimary} />
            <Text style={[styles.shareBtnText, { color: colors.onPrimary }]}>
              {t('annualReport.share', { defaultValue: 'Share Your Report' })}
            </Text>
          </TouchableOpacity>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  noReport: { fontSize: 15 },
  pager: { flex: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  statValue: { fontSize: 48, fontWeight: '800', marginBottom: 8 },
  statLabel: { fontSize: 20, fontWeight: '500' },
  yearEmoji: { fontSize: 72, marginBottom: 16 },
  yearTitle: { fontSize: 56, fontWeight: '800', marginBottom: 8 },
  yearSubtitle: { fontSize: 24, fontWeight: '600' },
  swipeHint: { fontSize: 14, marginTop: 32 },
  shareTitle: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  shareBtnText: { fontSize: 16, fontWeight: '600' },
});
