import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useReviewWords, useUpdateMastery } from '@/features/ai/hooks/useVocabulary';
import { SavedWord } from '@/services/api/ai';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

interface FlashcardReviewProps {
  onComplete: () => void;
  onClose: () => void;
}

export function FlashcardReview({ onComplete, onClose }: FlashcardReviewProps) {
  const { colors } = useTheme();
  const { data: reviewWords, isLoading, refetch } = useReviewWords();
  const updateMastery = useUpdateMastery();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const rotateY = useSharedValue(0);

  const currentWord = reviewWords?.[currentIndex];
  const totalCards = reviewWords?.length || 0;

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotate}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotate}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const flipCard = useCallback(() => {
    if (isFlipped) {
      rotateY.value = withTiming(0, { duration: 300 });
    } else {
      rotateY.value = withTiming(180, { duration: 300 });
    }
    setIsFlipped(!isFlipped);
  }, [isFlipped, rotateY]);

  const handleResponse = async (quality: number) => {
    if (!currentWord) return;

    // Update mastery based on quality (0-5 scale)
    // Quality: 0 = complete blackout, 5 = perfect response
    const newMastery = Math.min(100, Math.max(0, currentWord.masteryLevel + (quality - 2) * 10));

    try {
      await updateMastery.mutateAsync({
        wordId: currentWord.id,
        masteryLevel: newMastery,
      });
    } catch (error) {
      console.error('Failed to update mastery:', error);
    }

    setReviewedCount((prev) => prev + 1);

    // Move to next card
    if (currentIndex < totalCards - 1) {
      setIsFlipped(false);
      rotateY.value = 0;
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading flashcards...
        </Text>
      </View>
    );
  }

  if (!reviewWords || reviewWords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            All caught up!
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No cards due for review. Keep reading to collect more words!
          </Text>
          <Button title="Close" onPress={onClose} variant="primary" style={styles.closeButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progress}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {totalCards}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${((currentIndex + 1) / totalCards) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Card */}
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={flipCard}
        activeOpacity={0.9}
      >
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            frontAnimatedStyle,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.cardWord, { color: colors.text }]}>
            {currentWord?.word}
          </Text>
          {currentWord?.pronunciation && (
            <Text style={[styles.cardPronunciation, { color: colors.textSecondary }]}>
              {currentWord.pronunciation}
            </Text>
          )}
          <Text style={[styles.tapHint, { color: colors.textTertiary }]}>
            Tap to reveal definition
          </Text>
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.cardWord, { color: colors.text }]}>
            {currentWord?.word}
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.cardDefinition, { color: colors.text }]}>
            {currentWord?.definition}
          </Text>
          {currentWord?.examples && currentWord.examples.length > 0 && (
            <View style={styles.exampleSection}>
              <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>
                Example:
              </Text>
              <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                "{currentWord.examples[0]}"
              </Text>
            </View>
          )}
          {currentWord?.context && (
            <View style={[styles.contextBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>
                From: {currentWord.bookTitle || 'Your reading'}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Response buttons */}
      {isFlipped && (
        <View style={styles.responseContainer}>
          <Text style={[styles.responsePrompt, { color: colors.textSecondary }]}>
            How well did you know this?
          </Text>
          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseBtn, { backgroundColor: colors.error + '20' }]}
              onPress={() => handleResponse(1)}
            >
              <Text style={[styles.responseBtnText, { color: colors.error }]}>
                Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseBtn, { backgroundColor: colors.warning + '20' }]}
              onPress={() => handleResponse(3)}
            >
              <Text style={[styles.responseBtnText, { color: colors.warning }]}>
                Hard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseBtn, { backgroundColor: colors.success + '20' }]}
              onPress={() => handleResponse(4)}
            >
              <Text style={[styles.responseBtnText, { color: colors.success }]}>
                Good
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseBtn, { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleResponse(5)}
            >
              <Text style={[styles.responseBtnText, { color: colors.primary }]}>
                Easy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  closeBtn: {
    padding: 4,
  },
  progress: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 300,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardBack: {
    position: 'absolute',
  },
  cardWord: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardPronunciation: {
    fontSize: 16,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tapHint: {
    fontSize: 14,
    marginTop: 24,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  cardDefinition: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  exampleSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 16,
    gap: 6,
  },
  contextText: {
    fontSize: 12,
  },
  responseContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  responsePrompt: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  responseBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  responseBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  closeButton: {
    marginTop: 24,
    minWidth: 120,
  },
});
