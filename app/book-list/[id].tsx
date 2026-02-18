import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

// Mock data for book list detail - will be replaced with API calls
const MOCK_LISTS: Record<string, { title: string; description: string; books: MockBook[] }> = {
  'list-1': {
    title: 'Must-Read Classics',
    description: 'A curated collection of timeless literary masterpieces every reader should experience.',
    books: [
      { id: 'b1', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: '', difficulty: 3, isFree: true },
      { id: 'b2', title: '1984', author: 'George Orwell', coverUrl: '', difficulty: 2, isFree: true },
      { id: 'b3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: '', difficulty: 3, isFree: true },
      { id: 'b4', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: '', difficulty: 2, isFree: true },
      { id: 'b5', title: 'Jane Eyre', author: 'Charlotte Bronte', coverUrl: '', difficulty: 3, isFree: true },
    ],
  },
  'list-2': {
    title: 'Science & Discovery',
    description: 'Explore the wonders of science through these enlightening reads.',
    books: [
      { id: 'b6', title: 'A Brief History of Time', author: 'Stephen Hawking', coverUrl: '', difficulty: 4, isFree: false },
      { id: 'b7', title: 'The Origin of Species', author: 'Charles Darwin', coverUrl: '', difficulty: 4, isFree: true },
      { id: 'b8', title: 'Cosmos', author: 'Carl Sagan', coverUrl: '', difficulty: 3, isFree: false },
      { id: 'b9', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: '', difficulty: 3, isFree: false },
      { id: 'b10', title: 'The Selfish Gene', author: 'Richard Dawkins', coverUrl: '', difficulty: 4, isFree: false },
    ],
  },
  'feat-1': {
    title: "Editor's Picks",
    description: 'Handpicked by our editorial team for their exceptional quality and readability.',
    books: [
      { id: 'b11', title: 'The Catcher in the Rye', author: 'J.D. Salinger', coverUrl: '', difficulty: 2, isFree: true },
      { id: 'b12', title: 'Brave New World', author: 'Aldous Huxley', coverUrl: '', difficulty: 3, isFree: true },
    ],
  },
  'feat-2': {
    title: 'Best of 2025',
    description: 'The top rated books this year as chosen by our community.',
    books: [
      { id: 'b13', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: '', difficulty: 2, isFree: false },
    ],
  },
  'feat-3': {
    title: 'Beginner Friendly',
    description: 'Perfect for new English readers starting their reading journey.',
    books: [
      { id: 'b14', title: "Charlotte's Web", author: 'E.B. White', coverUrl: '', difficulty: 1, isFree: true },
      { id: 'b15', title: 'The Little Prince', author: 'Antoine de Saint-Exupery', coverUrl: '', difficulty: 1, isFree: true },
    ],
  },
};

interface MockBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  difficulty: number;
  isFree: boolean;
}

export default function BookListDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listData = MOCK_LISTS[id ?? ''];

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  if (!listData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Book List</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Book list not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderBookItem = ({ item }: { item: MockBook }) => (
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
  );

  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <Text style={[styles.listDescription, { color: colors.textSecondary }]}>{listData.description}</Text>
      <Text style={[styles.listCount, { color: colors.textTertiary }]}>
        {listData.books.length} books
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {listData.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Book List */}
      <FlashList
        data={listData.books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
      />
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
  listHeaderContainer: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  listDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  listCount: {
    fontSize: 13,
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
