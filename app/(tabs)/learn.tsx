import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { useVocabularyList, useReviewWords } from '@/features/ai/hooks/useVocabulary';

export default function LearnScreen() {
  const { colors } = useTheme();
  const dailyGoal = useSettingsStore((state) => state.dailyGoal);

  const { data: vocabularyData, isLoading: vocabLoading } = useVocabularyList();
  const { data: reviewWords, isLoading: reviewLoading } = useReviewWords();

  const totalWords = vocabularyData?.pages.flat().length || 0;
  const cardsToReview = reviewWords?.length || 0;
  const todayWords = 5; // Would come from a daily stats API
  const streak = 7; // Would come from user stats API

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Learn</Text>
      </View>

      {/* Daily Progress */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Progress</Text>
        <View style={styles.progressCircle}>
          <View
            style={[
              styles.progressCircleInner,
              { borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.progressNumber, { color: colors.primary }]}>
              {todayWords}
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              / {dailyGoal} words
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="book" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalWords}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Words
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/flashcard-review')}
        >
          <Ionicons name="flash" size={32} color={colors.onPrimary} />
          <Text style={[styles.actionTitle, { color: colors.onPrimary }]}>
            Review Flashcards
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.onPrimary + 'CC' }]}>
            {reviewLoading ? '...' : `${cardsToReview} cards due`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/vocabulary-list')}
        >
          <Ionicons name="list" size={32} color={colors.primary} />
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            Word List
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
            {vocabLoading ? '...' : `${totalWords} saved words`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Words */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Words</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wordsList}>
          {['eloquent', 'serendipity', 'ephemeral'].map((word, index) => (
            <View
              key={word}
              style={[
                styles.wordItem,
                { borderBottomColor: colors.border },
                index === 2 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
  },
  progressCircle: {
    alignItems: 'center',
    marginVertical: 24,
  },
  progressCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  wordsList: {},
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  wordText: {
    fontSize: 16,
  },
});
