import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useBooks } from '@/features/books';
import type { Book } from '@/services/api/books';

const CATEGORY_TITLES: Record<string, string> = {
  fiction: 'Fiction',
  'non-fiction': 'Non-Fiction',
  classics: 'Classics',
  science: 'Science',
  biography: 'Biography',
  philosophy: 'Philosophy',
  poetry: 'Poetry',
  history: 'History',
};

export default function CategoryBooksScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryTitle = CATEGORY_TITLES[id ?? ''] ?? id ?? 'Category';

  const { data: books, isLoading } = useBooks({
    category: id,
    pageSize: 30,
  });

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => (
      <TouchableOpacity
        style={[styles.bookRow, { borderBottomColor: colors.borderLight }]}
        onPress={() => handleBookPress(item.id)}
      >
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.bookCover} resizeMode="cover" />
        ) : (
          <View style={[styles.bookCoverPlaceholder, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.author}
          </Text>
          <View style={styles.bookMeta}>
            <View style={styles.difficultyContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.difficultyDot,
                    { backgroundColor: i < item.difficulty ? colors.primary : colors.border },
                  ]}
                />
              ))}
            </View>
            {item.isFree && (
              <View style={[styles.freeBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.freeText, { color: colors.success }]}>Free</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    ),
    [colors, handleBookPress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !books || books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No books in {categoryTitle}
          </Text>
        </View>
      ) : (
        <FlashList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
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
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookCover: {
    width: 48,
    height: 68,
    borderRadius: 6,
    marginRight: 12,
  },
  bookCoverPlaceholder: {
    width: 48,
    height: 68,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 6,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  freeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
