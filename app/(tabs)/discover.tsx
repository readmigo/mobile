import { useState, useDeferredValue, useCallback, memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  Animated,
  FlatList,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useSearchBooks, useBooks, SearchBook } from '@/features/books';
import type { Book } from '@/services/api/books';

// --- Mock Data ---

const BANNERS = [
  {
    id: '1',
    title: 'New Arrivals',
    subtitle: 'Discover the latest additions to our library',
    gradient: ['#4A9B7B', '#2D5A7B'],
    icon: 'sparkles',
  },
  {
    id: '2',
    title: 'Classic Literature',
    subtitle: 'Timeless works that shaped the world',
    gradient: ['#7B4A2D', '#5B3A1A'],
    icon: 'library',
  },
  {
    id: '3',
    title: 'AI Reading Assistant',
    subtitle: 'Get instant explanations while you read',
    gradient: ['#2D5A7B', '#1A3A5B'],
    icon: 'bulb',
  },
  {
    id: '4',
    title: 'Free Books',
    subtitle: 'Hundreds of public domain classics',
    gradient: ['#4CAF50', '#2E7D32'],
    icon: 'gift',
  },
];

const CATEGORY_MENU = [
  { key: 'fiction', label: 'Fiction', icon: 'book' as const },
  { key: 'non-fiction', label: 'Non-Fiction', icon: 'document-text' as const },
  { key: 'classics', label: 'Classics', icon: 'library' as const },
  { key: 'science', label: 'Science', icon: 'flask' as const },
  { key: 'biography', label: 'Biography', icon: 'person' as const },
  { key: 'philosophy', label: 'Philosophy', icon: 'bulb' as const },
  { key: 'poetry', label: 'Poetry', icon: 'musical-notes' as const },
  { key: 'history', label: 'History', icon: 'time' as const },
];

const SEARCH_HISTORY = ['The Great Gatsby', 'Shakespeare', 'Science Fiction', 'Jane Austen'];

const POPULAR_SEARCHES = [
  'Pride and Prejudice',
  'To Kill a Mockingbird',
  '1984',
  'Hamlet',
  'Don Quixote',
  'The Odyssey',
];

const MOCK_BOOK_LISTS = [
  {
    id: 'list-1',
    title: 'Must-Read Classics',
    books: [
      { id: 'b1', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: '', difficulty: 3, isFree: true },
      { id: 'b2', title: '1984', author: 'George Orwell', coverUrl: '', difficulty: 2, isFree: true },
      { id: 'b3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: '', difficulty: 3, isFree: true },
      { id: 'b4', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: '', difficulty: 2, isFree: true },
      { id: 'b5', title: 'Jane Eyre', author: 'Charlotte Bronte', coverUrl: '', difficulty: 3, isFree: true },
    ],
  },
  {
    id: 'list-2',
    title: 'Science & Discovery',
    books: [
      { id: 'b6', title: 'A Brief History of Time', author: 'Stephen Hawking', coverUrl: '', difficulty: 4, isFree: false },
      { id: 'b7', title: 'The Origin of Species', author: 'Charles Darwin', coverUrl: '', difficulty: 4, isFree: true },
      { id: 'b8', title: 'Cosmos', author: 'Carl Sagan', coverUrl: '', difficulty: 3, isFree: false },
      { id: 'b9', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: '', difficulty: 3, isFree: false },
      { id: 'b10', title: 'The Selfish Gene', author: 'Richard Dawkins', coverUrl: '', difficulty: 4, isFree: false },
    ],
  },
];

const FEATURED_LISTS = [
  { id: 'feat-1', title: 'Editor\'s Picks', description: 'Handpicked by our editorial team', bookCount: 12, coverColor: '#4A9B7B' },
  { id: 'feat-2', title: 'Best of 2025', description: 'Top rated books this year', bookCount: 20, coverColor: '#7B4A2D' },
  { id: 'feat-3', title: 'Beginner Friendly', description: 'Perfect for new English readers', bookCount: 15, coverColor: '#2D5A7B' },
];

// --- Types ---

type DisplayBook = Book | SearchBook | MockBook;

interface MockBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  difficulty: number;
  isFree: boolean;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  gradient: string[];
  icon: string;
}

// --- BookCard Component ---

interface BookCardProps {
  book: DisplayBook;
  onPress: () => void;
  compact?: boolean;
}

const BookCard = memo(function BookCard({ book, onPress, compact = false }: BookCardProps) {
  const { colors } = useTheme();
  const difficulty = 'difficulty' in book ? book.difficulty : ('difficultyScore' in book ? (book.difficultyScore ?? 0) : 0);
  const isFree = 'isFree' in book ? book.isFree : true;

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactBookCard, { backgroundColor: colors.surface }]} onPress={onPress}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.compactBookCover} resizeMode="cover" />
        ) : (
          <View style={[styles.compactBookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
        )}
        <Text style={[styles.compactBookTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.compactBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {'author' in book ? book.author ?? '' : ''}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.bookCover} resizeMode="cover" />
      ) : (
        <View style={[styles.bookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="book" size={24} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
        {'author' in book ? book.author ?? '' : ''}
      </Text>
      <View style={styles.bookMeta}>
        <View style={styles.difficultyContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.difficultyDot,
                { backgroundColor: i < difficulty ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
        {isFree && (
          <View style={[styles.freeBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.freeText, { color: colors.success }]}>Free</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

// --- Banner Carousel Component ---

const BannerCarousel = memo(function BannerCarousel() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const BANNER_WIDTH = width - 32;
  const BANNER_HEIGHT = 140;

  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, 4000);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [activeIndex, BANNER_WIDTH]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  const renderBannerItem = useCallback(
    ({ item, index }: { item: BannerItem; index: number }) => {
      const inputRange = [
        (index - 1) * BANNER_WIDTH,
        index * BANNER_WIDTH,
        (index + 1) * BANNER_WIDTH,
      ];

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.95, 1, 0.95],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.7, 1, 0.7],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={[
            styles.bannerItem,
            {
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <View style={[styles.bannerGradient, { backgroundColor: item.gradient[0] }]}>
            <View style={[styles.bannerCircle, styles.bannerCircle1, { backgroundColor: item.gradient[1] + '40' }]} />
            <View style={[styles.bannerCircle, styles.bannerCircle2, { backgroundColor: item.gradient[1] + '30' }]} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.bannerIconContainer}>
                <Ionicons name={item.icon as any} size={48} color="rgba(255, 255, 255, 0.9)" />
              </View>
            </View>
          </View>
        </Animated.View>
      );
    },
    [BANNER_WIDTH, BANNER_HEIGHT, scrollX]
  );

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.bannerList}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationContainer}>
        {BANNERS.map((_, index) => {
          const inputRange = [
            (index - 1) * BANNER_WIDTH,
            index * BANNER_WIDTH,
            (index + 1) * BANNER_WIDTH,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { width: dotWidth, opacity: dotOpacity, backgroundColor: colors.primary },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
});

// --- Category Menu Component ---

const CategoryMenu = memo(function CategoryMenu() {
  const { colors } = useTheme();

  const handleCategoryPress = useCallback((key: string) => {
    router.push(`/category/${key}` as any);
  }, []);

  return (
    <View style={styles.categoryMenuContainer}>
      <View style={styles.categoryGrid}>
        {CATEGORY_MENU.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={styles.categoryMenuItem}
            onPress={() => handleCategoryPress(cat.key)}
          >
            <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={cat.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={[styles.categoryMenuLabel, { color: colors.text }]} numberOfLines={1}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// --- Book List Section (Horizontal Carousel) ---

interface BookListSectionProps {
  listId: string;
  title: string;
  books: MockBook[];
}

const BookListSection = memo(function BookListSection({ listId, title, books }: BookListSectionProps) {
  const { colors } = useTheme();

  const handleSeeAll = useCallback(() => {
    router.push(`/book-list/${listId}` as any);
  }, [listId]);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  return (
    <View style={styles.bookListSection}>
      <View style={styles.bookListHeader}>
        <Text style={[styles.bookListTitle, { color: colors.text }]}>{title}</Text>
        <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bookListScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => handleBookPress(item.id)} compact />
        )}
      />
    </View>
  );
});

// --- Featured Book Lists Section ---

const FeaturedBookListsSection = memo(function FeaturedBookListsSection() {
  const { colors } = useTheme();

  const handleListPress = useCallback((listId: string) => {
    router.push(`/book-list/${listId}` as any);
  }, []);

  return (
    <View style={styles.featuredSection}>
      <Text style={[styles.featuredSectionTitle, { color: colors.text }]}>Featured Book Lists</Text>
      {FEATURED_LISTS.map((list) => (
        <TouchableOpacity
          key={list.id}
          style={[styles.featuredCard, { backgroundColor: colors.surface }]}
          onPress={() => handleListPress(list.id)}
        >
          <View style={[styles.featuredCover, { backgroundColor: list.coverColor }]}>
            <Ionicons name="library" size={24} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.featuredInfo}>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>{list.title}</Text>
            <Text style={[styles.featuredDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {list.description}
            </Text>
            <Text style={[styles.featuredCount, { color: colors.textTertiary }]}>
              {list.bookCount} books
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </View>
  );
});

// --- Search Page Overlay ---

interface SearchPageProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
}

const SearchPage = memo(function SearchPage({ query, onChangeQuery, onClose }: SearchPageProps) {
  const { colors } = useTheme();
  const deferredQuery = useDeferredValue(query);
  const isSearching = deferredQuery.length > 1;
  const { data: searchResults, isLoading } = useSearchBooks(deferredQuery);
  const [history, setHistory] = useState<string[]>(SEARCH_HISTORY);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  const handleHistoryPress = useCallback((term: string) => {
    onChangeQuery(term);
  }, [onChangeQuery]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handlePopularPress = useCallback((term: string) => {
    onChangeQuery(term);
  }, [onChangeQuery]);

  // Search results view
  if (isSearching) {
    if (isLoading) {
      return (
        <View style={[styles.searchPage, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      );
    }

    if (!searchResults || searchResults.length === 0) {
      return (
        <View style={[styles.searchPage, { backgroundColor: colors.background }]}>
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No results for "{deferredQuery}"
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.searchPage, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.searchResultsScroll}>
          <Text style={[styles.searchSectionLabel, { color: colors.textSecondary }]}>
            Books ({searchResults.length})
          </Text>
          {searchResults.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={[styles.searchResultRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => handleBookPress(book.id)}
            >
              {book.coverUrl ? (
                <Image source={{ uri: book.coverUrl }} style={styles.searchResultCover} />
              ) : (
                <View style={[styles.searchResultCoverPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="book" size={16} color={colors.primary} />
                </View>
              )}
              <View style={styles.searchResultInfo}>
                <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>
                  {book.title}
                </Text>
                {'author' in book && book.author ? (
                  <Text style={[styles.searchResultAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {book.author}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Default search page: history + popular searches
  return (
    <View style={[styles.searchPage, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.searchPageContent}>
        {/* Search History */}
        {history.length > 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchSectionHeader}>
              <Text style={[styles.searchSectionLabel, { color: colors.textSecondary }]}>Search History</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {history.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => handleHistoryPress(term)}
                >
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.tagText, { color: colors.text }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Popular Searches */}
        <View style={styles.searchSection}>
          <Text style={[styles.searchSectionLabel, { color: colors.textSecondary }]}>Popular Searches</Text>
          <View style={styles.tagContainer}>
            {POPULAR_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => handlePopularPress(term)}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.tagText, { color: colors.text }]}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

// --- Main Screen ---

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    inputRef.current?.blur();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {isSearchActive ? (
          <TouchableOpacity onPress={handleSearchClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.headerTitle, { color: colors.text }, isSearchActive && styles.headerTitleCompact]}>
          Discover
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search books, authors..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearchFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {isSearchActive && searchQuery.length === 0 && (
          <TouchableOpacity onPress={handleSearchClose}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Page or Main Content */}
      {isSearchActive ? (
        <SearchPage
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={handleSearchClose}
        />
      ) : (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <BannerCarousel />

          {/* Category Menu */}
          <CategoryMenu />

          {/* Book Lists */}
          {MOCK_BOOK_LISTS.map((list) => (
            <BookListSection
              key={list.id}
              listId={list.id}
              title={list.title}
              books={list.books}
            />
          ))}

          {/* Featured Book Lists */}
          <FeaturedBookListsSection />

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleCompact: {
    fontSize: 20,
  },
  backButton: {
    marginRight: 12,
  },
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Main scroll
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 32,
  },
  bottomSpacer: {
    height: 16,
  },
  // Banner styles
  bannerContainer: {
    marginBottom: 8,
  },
  bannerList: {
    paddingHorizontal: 16,
  },
  bannerItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  bannerCircle1: {
    width: 150,
    height: 150,
    top: -40,
    right: -30,
  },
  bannerCircle2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -20,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  bannerIconContainer: {
    marginLeft: 16,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  // Category Menu
  categoryMenuContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryMenuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryMenuLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Book List Section
  bookListSection: {
    marginBottom: 24,
  },
  bookListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bookListTitle: {
    fontSize: 18,
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
  bookListScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  // Compact Book Card (for horizontal scroll)
  compactBookCard: {
    width: 120,
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 10,
  },
  compactBookCover: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 6,
    marginBottom: 6,
  },
  compactBookCoverPlaceholder: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactBookTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactBookAuthor: {
    fontSize: 10,
  },
  // Featured Section
  featuredSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  featuredSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  featuredCover: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featuredDescription: {
    fontSize: 13,
    marginBottom: 2,
  },
  featuredCount: {
    fontSize: 12,
  },
  // Search Page
  searchPage: {
    flex: 1,
  },
  searchPageContent: {
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
  },
  // Search Results
  searchResultsScroll: {
    padding: 16,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchResultCover: {
    width: 40,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultCoverPlaceholder: {
    width: 40,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  searchResultAuthor: {
    fontSize: 13,
  },
  // Standard book card
  bookCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 12,
  },
  bookCover: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookCoverPlaceholder: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Loading / Empty
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
});
