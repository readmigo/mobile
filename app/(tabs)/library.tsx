import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

// Placeholder data
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    progress: 0.35,
    coverUrl: 'https://placeholder.com/book1',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    progress: 0.72,
    coverUrl: 'https://placeholder.com/book2',
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    progress: 0.15,
    coverUrl: 'https://placeholder.com/book3',
  },
];

interface BookCardProps {
  book: typeof mockBooks[0];
  onPress: () => void;
}

function BookCard({ book, onPress }: BookCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.bookCover, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="book" size={32} color={colors.primary} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${book.progress * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textTertiary }]}>
            {Math.round(book.progress * 100)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { colors } = useTheme();

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Library</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {mockBooks.length > 0 ? (
        <FlashList
          data={mockBooks}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => handleBookPress(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your library is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Discover books to start your reading journey
          </Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={[styles.discoverButtonText, { color: colors.onPrimary }]}>
              Discover Books
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bookCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    width: 35,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  discoverButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
