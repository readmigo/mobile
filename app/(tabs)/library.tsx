import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { UserBook } from '@/services/api/books';
import {
  useCurrentlyReading,
  useRecentlyBrowsed,
  useFavoriteBooks,
} from '@/features/library/hooks/useLibrary';

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
  userBook: UserBook;
}

function CurrentlyReadingSection({ userBook }: CurrentlyReadingSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/book/reader',
      params: { bookId: userBook.bookId, initialCfi: userBook.currentCfi },
    });
  }, [userBook.bookId, userBook.currentCfi]);

  const book = userBook.book;

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
                      width: `${Math.round(userBook.progress * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                {t('library.progress', { value: Math.round(userBook.progress * 100) })}
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
  books: UserBook[];
}

function RecentlyBrowsedSection({ books }: RecentlyBrowsedSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: UserBook }) => (
      <TouchableOpacity
        style={styles.recentlyBrowsedItem}
        onPress={() => handleBookPress(item.bookId)}
        activeOpacity={0.7}
      >
        {item.book.coverUrl ? (
          <Image
            source={{ uri: item.book.coverUrl }}
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
          {item.book.title}
        </Text>
        <Text
          style={[styles.recentlyBrowsedAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.book.author}
        </Text>
      </TouchableOpacity>
    ),
    [colors, handleBookPress],
  );

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title={t('library.recentlyBrowsed')}
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
  books: UserBook[];
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

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title={t('library.favoriteBooks')}
        seeAllLabel={t('library.seeAll')}
      />
      <View style={styles.favoritesGrid}>
        {books.map((userBook) => (
          <TouchableOpacity
            key={userBook.id}
            style={[styles.favoriteItem, { width: itemWidth }]}
            onPress={() => handleBookPress(userBook.bookId)}
            activeOpacity={0.7}
          >
            {userBook.book.coverUrl ? (
              <Image
                source={{ uri: userBook.book.coverUrl }}
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
              {userBook.book.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- Loading State ---

function LibraryLoadingState() {
  const { colors } = useTheme();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
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
        {t('library.emptyTitle')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('library.emptySubtitle')}
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

  const { data: currentlyReading, isLoading: loadingCurrent, refetch: refetchCurrent } = useCurrentlyReading();
  const { data: recentlyBrowsed, isLoading: loadingRecent, refetch: refetchRecent } = useRecentlyBrowsed();
  const { data: favoriteBooks, isLoading: loadingFavorites, refetch: refetchFavorites } = useFavoriteBooks();

  const isLoading = loadingCurrent && loadingRecent && loadingFavorites;

  const handleRefresh = useCallback(() => {
    refetchCurrent();
    refetchRecent();
    refetchFavorites();
  }, [refetchCurrent, refetchRecent, refetchFavorites]);

  const hasContent =
    currentlyReading ||
    (recentlyBrowsed && recentlyBrowsed.length > 0) ||
    (favoriteBooks && favoriteBooks.length > 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LibraryLoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {hasContent ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {currentlyReading && (
            <CurrentlyReadingSection userBook={currentlyReading} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
