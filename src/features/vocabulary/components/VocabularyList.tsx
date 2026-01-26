import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useVocabularyList, useDeleteVocabulary } from '@/features/ai/hooks/useVocabulary';
import { SavedWord } from '@/services/api/ai';

interface VocabularyListProps {
  bookId?: string;
  onWordPress?: (word: SavedWord) => void;
}

export function VocabularyList({ bookId, onWordPress }: VocabularyListProps) {
  const { colors } = useTheme();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVocabularyList({ bookId });
  const deleteWord = useDeleteVocabulary();

  const words = data?.pages.flat() || [];

  const handleDelete = async (wordId: string) => {
    try {
      await deleteWord.mutateAsync(wordId);
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return colors.success;
    if (level >= 50) return colors.warning;
    return colors.error;
  };

  const renderItem = ({ item }: { item: SavedWord }) => (
    <TouchableOpacity
      style={[styles.wordCard, { backgroundColor: colors.surface }]}
      onPress={() => onWordPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wordMain}>
        <View style={styles.wordHeader}>
          <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
          <View
            style={[
              styles.masteryBadge,
              { backgroundColor: getMasteryColor(item.masteryLevel) + '20' },
            ]}
          >
            <Text
              style={[styles.masteryText, { color: getMasteryColor(item.masteryLevel) }]}
            >
              {item.masteryLevel}%
            </Text>
          </View>
        </View>

        <Text
          style={[styles.definitionText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.definition}
        </Text>

        {item.bookTitle && (
          <View style={styles.bookInfo}>
            <Ionicons name="book-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.bookTitle, { color: colors.textTertiary }]}>
              {item.bookTitle}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No saved words yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Select text while reading to save vocabulary
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={words}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  wordCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  wordMain: {
    flex: 1,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
  },
  masteryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  masteryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  definitionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 12,
  },
  deleteBtn: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  footer: {
    paddingVertical: 16,
  },
});
