import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

// --- Mock Data Types ---

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  progress: number;
  isFavorite: boolean;
  lastReadAt: string;
}

// --- Mock Data (to be replaced by real API hooks) ---

const mockCurrentlyReading: LibraryBook | null = {
  id: '1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  coverUrl: null,
  progress: 0.35,
  isFavorite: false,
  lastReadAt: '2026-02-18T10:00:00Z',
};

const mockRecentlyBrowsed: LibraryBook[] = [
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    coverUrl: null,
    progress: 0,
    isFavorite: false,
    lastReadAt: '2026-02-17T15:00:00Z',
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: null,
    progress: 0,
    isFavorite: false,
    lastReadAt: '2026-02-16T12:00:00Z',
  },
  {
    id: '4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverUrl: null,
    progress: 0,
    isFavorite: false,
    lastReadAt: '2026-02-15T09:00:00Z',
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverUrl: null,
    progress: 0,
    isFavorite: false,
    lastReadAt: '2026-02-14T08:00:00Z',
  },
];

const mockFavoriteBooks: LibraryBook[] = [
  {
    id: '6',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    coverUrl: null,
    progress: 0.8,
    isFavorite: true,
    lastReadAt: '2026-02-13T10:00:00Z',
  },
  {
    id: '7',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverUrl: null,
    progress: 1.0,
    isFavorite: true,
    lastReadAt: '2026-02-12T10:00:00Z',
  },
  {
    id: '8',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    coverUrl: null,
    progress: 0.5,
    isFavorite: true,
    lastReadAt: '2026-02-11T10:00:00Z',
  },
];

// --- Placeholder hooks (to be replaced with real API calls) ---

function useCurrentlyReading() {
  return { data: mockCurrentlyReading };
}

function useRecentlyBrowsed() {
  return { data: mockRecentlyBrowsed };
}

function useFavoriteBooks() {
  return { data: mockFavoriteBooks };
}

// --- Section Header ---

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

function SectionHeader({ title, onSeeAll, seeAllLabel }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>
            {seeAllLabel}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Currently Reading Section ---

interface CurrentlyReadingSectionProps {
  book: LibraryBook;
}

function CurrentlyReadingSection({ book }: CurrentlyReadingSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    router.push('/book/reader');
  }, []);

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title={t('library.currentlyReading')} />
      <TouchableOpacity
        style={[styles.currentlyReadingCard, { backgroundColor: colors.surface }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.currentlyReadingContent}>
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.currentlyReadingCover}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.currentlyReadingCover,
                styles.coverPlaceholder,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Ionicons name="book" size={36} color={colors.primary} />
            </View>
          )}
          <View style={styles.currentlyReadingInfo}>
            <Text
              style={[styles.currentlyReadingTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.currentlyReadingAuthor, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {book.author}
            </Text>
            <View style={styles.progressSection}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.round(book.progress * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                {t('library.progress', { percent: Math.round(book.progress * 100) })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: colors.primary }]}
              onPress={handlePress}
            >
              <Text style={[styles.continueButtonText, { color: colors.onPrimary }]}>
                {t('library.continueReading')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// --- Recently Browsed Section ---

interface RecentlyBrowsedSectionProps {
  books: LibraryBook[];
}

function RecentlyBrowsedSection({ books }: RecentlyBrowsedSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  const handleSeeAll = useCallback(() => {
    // TODO: navigate to full recently browsed list
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: LibraryBook }) => (
      <TouchableOpacity
        style={styles.recentlyBrowsedItem}
        onPress={() => handleBookPress(item.id)}
        activeOpacity={0.7}
      >
        {item.coverUrl ? (
          <Image
            source={{ uri: item.coverUrl }}
            style={styles.recentlyBrowsedCover}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.recentlyBrowsedCover,
              styles.coverPlaceholder,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
        )}
        <Text
          style={[styles.recentlyBrowsedTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.recentlyBrowsedAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.author}
        </Text>
      </TouchableOpacity>
    ),
    [colors, handleBookPress],
  );

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title={t('library.recentlyBrowsed')}
        onSeeAll={handleSeeAll}
        seeAllLabel={t('library.seeAll')}
      />
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentlyBrowsedList}
      />
    </View>
  );
}

// --- Favorite Books Section ---

interface FavoriteBooksSectionProps {
  books: LibraryBook[];
}

function FavoriteBooksSection({ books }: FavoriteBooksSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const NUM_COLUMNS = 3;
  const HORIZONTAL_PADDING = 16;
  const ITEM_GAP = 12;
  const itemWidth =
    (width - HORIZONTAL_PADDING * 2 - ITEM_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  const handleSeeAll = useCallback(() => {
    // TODO: navigate to full favorites list
  }, []);

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title={t('library.favoriteBooks')}
        onSeeAll={handleSeeAll}
        seeAllLabel={t('library.seeAll')}
      />
      <View style={styles.favoritesGrid}>
        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[styles.favoriteItem, { width: itemWidth }]}
            onPress={() => handleBookPress(book.id)}
            activeOpacity={0.7}
          >
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={[styles.favoriteCover, { width: itemWidth, height: itemWidth * 1.5 }]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.favoriteCover,
                  styles.coverPlaceholder,
                  {
                    width: itemWidth,
                    height: itemWidth * 1.5,
                    backgroundColor: colors.primary + '20',
                  },
                ]}
              >
                <Ionicons name="book" size={28} color={colors.primary} />
              </View>
            )}
            <Text
              style={[styles.favoriteTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {book.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- Empty State ---

function EmptyLibraryState() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleDiscover = useCallback(() => {
    router.push('/(tabs)/discover');
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('library.empty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('library.emptyDescription')}
      </Text>
      <TouchableOpacity
        style={[styles.discoverButton, { backgroundColor: colors.primary }]}
        onPress={handleDiscover}
      >
        <Text style={[styles.discoverButtonText, { color: colors.onPrimary }]}>
          {t('library.discoverBooks')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Main Screen ---

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: currentlyReading } = useCurrentlyReading();
  const { data: recentlyBrowsed } = useRecentlyBrowsed();
  const { data: favoriteBooks } = useFavoriteBooks();

  const hasContent =
    currentlyReading ||
    (recentlyBrowsed && recentlyBrowsed.length > 0) ||
    (favoriteBooks && favoriteBooks.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('library.title')}
        </Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {hasContent ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentlyReading && (
            <CurrentlyReadingSection book={currentlyReading} />
          )}

          {recentlyBrowsed && recentlyBrowsed.length > 0 && (
            <RecentlyBrowsedSection books={recentlyBrowsed} />
          )}

          {favoriteBooks && favoriteBooks.length > 0 && (
            <FavoriteBooksSection books={favoriteBooks} />
          )}
        </ScrollView>
      ) : (
        <EmptyLibraryState />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: 24,
  },

  // Cover placeholder
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Currently Reading
  currentlyReadingCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  currentlyReadingContent: {
    flexDirection: 'row',
  },
  currentlyReadingCover: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  currentlyReadingInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  currentlyReadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentlyReadingAuthor: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Recently Browsed
  recentlyBrowsedList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentlyBrowsedItem: {
    width: 100,
  },
  recentlyBrowsedCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  recentlyBrowsedTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentlyBrowsedAuthor: {
    fontSize: 11,
  },

  // Favorites Grid
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  favoriteItem: {
    marginBottom: 4,
  },
  favoriteCover: {
    borderRadius: 8,
    marginBottom: 6,
  },
  favoriteTitle: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
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
