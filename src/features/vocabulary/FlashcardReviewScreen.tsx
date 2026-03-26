import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, SavedWord } from '@/services/api/ai';

export function FlashcardReviewScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: reviewWords, isLoading } = useQuery({
    queryKey: ['vocabulary', 'review'],
    queryFn: () => aiApi.getWordsForReview(),
    select: (res) => res.data,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);

  const updateMastery = useMutation({
    mutationFn: ({ wordId, level }: { wordId: string; level: number }) =>
      aiApi.updateWordMastery(wordId, level),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const currentWord = reviewWords?.[currentIndex];
  const totalWords = reviewWords?.length ?? 0;

  const handleRate = useCallback(
    (masteryLevel: number) => {
      if (!currentWord) return;
      updateMastery.mutate({ wordId: currentWord.id, level: masteryLevel });
      setCompleted((c) => c + 1);
      setIsFlipped(false);
      if (currentIndex < totalWords - 1) {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentWord, currentIndex, totalWords, updateMastery],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!reviewWords || reviewWords.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="checkmark-circle-outline" size={64} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>All caught up!</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No words due for review right now.
        </Text>
      </View>
    );
  }

  if (completed >= totalWords) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="trophy-outline" size={64} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Review Complete!</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          You reviewed {completed} word{completed !== 1 ? 's' : ''}.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View style={styles.progress}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentIndex + 1} / {totalWords}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${((currentIndex + 1) / totalWords) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsFlipped(!isFlipped)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
          },
        ]}
      >
        {!isFlipped ? (
          <View style={styles.cardContent}>
            <Text style={[styles.wordText, { color: colors.text }]}>{currentWord?.word}</Text>
            {currentWord?.pronunciation && (
              <Text style={[styles.pronunciation, { color: colors.textSecondary }]}>
                {currentWord.pronunciation}
              </Text>
            )}
            <Text style={[styles.tapHint, { color: colors.textTertiary }]}>Tap to reveal</Text>
          </View>
        ) : (
          <View style={styles.cardContent}>
            <Text style={[styles.wordTextSmall, { color: colors.primary }]}>{currentWord?.word}</Text>
            <Text style={[styles.definitionText, { color: colors.text }]}>{currentWord?.definition}</Text>
            {currentWord?.examples?.[0] && (
              <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                "{currentWord.examples[0]}"
              </Text>
            )}
            {currentWord?.context && (
              <Text style={[styles.contextText, { color: colors.textTertiary }]}>
                Context: {currentWord.context}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Rating Buttons (SM-2: 0-5) */}
      {isFlipped && (
        <View style={styles.ratingRow}>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleRate(1)}
          >
            <Text style={styles.rateText}>Again</Text>
            <Text style={styles.rateSubtext}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: '#FF9800' }]}
            onPress={() => handleRate(2)}
          >
            <Text style={styles.rateText}>Hard</Text>
            <Text style={styles.rateSubtext}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: '#8BC34A' }]}
            onPress={() => handleRate(3)}
          >
            <Text style={styles.rateText}>Good</Text>
            <Text style={styles.rateSubtext}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleRate(5)}
          >
            <Text style={styles.rateText}>Easy</Text>
            <Text style={styles.rateSubtext}>5</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  progress: { padding: 16, gap: 8 },
  progressText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  card: {
    flex: 1, margin: 16, borderRadius: 20, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  cardContent: { alignItems: 'center', padding: 32, gap: 12 },
  wordText: { fontSize: 32, fontWeight: '700' },
  wordTextSmall: { fontSize: 20, fontWeight: '700' },
  pronunciation: { fontSize: 16, fontStyle: 'italic' },
  tapHint: { fontSize: 14, marginTop: 24 },
  definitionText: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  exampleText: { fontSize: 15, lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  contextText: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  ratingRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 32 },
  rateButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  rateText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  rateSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
