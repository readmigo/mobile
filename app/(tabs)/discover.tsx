import { useState, useDeferredValue, useCallback, memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  Animated,
  FlatList,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useSearchBooks, SearchBook } from '@/features/books';
import type { Book } from '@/services/api/books';

// --- Mock Data ---

const BANNERS = [
  {
    id: '1',
    titleKey: 'editorsChoice',
    subtitle: 'Handpicked by our editorial team',
    bookCount: 12,
    bgColor: '#4A9B7B',
    icon: 'star' as const,
    typeBadge: 'Collection',
  },
  {
    id: '2',
    titleKey: 'mustReadClassics',
    subtitle: 'Timeless works that shaped the world',
    bookCount: 25,
    bgColor: '#7B4A2D',
    icon: 'library' as const,
    typeBadge: 'Classics',
  },
  {
    id: '3',
    titleKey: 'bestOf2025',
    subtitle: 'Top rated books this year',
    bookCount: 20,
    bgColor: '#2D5A7B',
    icon: 'trophy' as const,
    typeBadge: 'Annual',
  },
  {
    id: '4',
    titleKey: 'beginnerFriendly',
    subtitle: 'Perfect for new English readers',
    bookCount: 15,
    bgColor: '#6B4A8B',
    icon: 'rocket' as const,
    typeBadge: 'Beginner',
  },
];

const CATEGORY_MENU = [
  { key: 'fiction', labelKey: 'fiction', icon: 'book' as const },
  { key: 'non-fiction', labelKey: 'nonFiction', icon: 'document-text' as const },
  { key: 'classics', labelKey: 'classics', icon: 'library' as const },
  { key: 'science', labelKey: 'science', icon: 'flask' as const },
  { key: 'biography', labelKey: 'biography', icon: 'person' as const },
  { key: 'philosophy', labelKey: 'philosophy', icon: 'bulb' as const },
  { key: 'poetry', labelKey: 'poetry', icon: 'musical-notes' as const },
  { key: 'history', labelKey: 'history', icon: 'time' as const },
  { key: 'adventure', labelKey: 'adventure', icon: 'compass' as const },
  { key: 'romance', labelKey: 'romance', icon: 'heart' as const },
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
    titleKey: 'mustReadClassics',
    isRanked: true,
    books: [
      { id: 'b1', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: '', difficulty: 3, isFree: true, wordCount: 122000, rating: 4.8, description: 'A witty exploration of love, marriage, and social class in Regency-era England.' },
      { id: 'b2', title: '1984', author: 'George Orwell', coverUrl: '', difficulty: 2, isFree: true, wordCount: 88000, rating: 4.7, description: 'A dystopian novel set in a totalitarian society under constant surveillance.' },
      { id: 'b3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: '', difficulty: 3, isFree: true, wordCount: 47000, rating: 4.5, description: 'A tale of wealth, love, and the American Dream in the Jazz Age.' },
      { id: 'b4', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: '', difficulty: 2, isFree: true, wordCount: 100000, rating: 4.8, description: 'A story of racial injustice and childhood innocence in the American South.' },
      { id: 'b5', title: 'Jane Eyre', author: 'Charlotte Bronte', coverUrl: '', difficulty: 3, isFree: true, wordCount: 187000, rating: 4.6, description: 'A passionate and independent heroine navigates love, morality, and self-respect.' },
    ],
  },
  {
    id: 'list-2',
    titleKey: 'scienceDiscovery',
    isRanked: false,
    books: [
      { id: 'b6', title: 'A Brief History of Time', author: 'Stephen Hawking', coverUrl: '', difficulty: 4, isFree: false, wordCount: 65000, rating: 4.6, description: 'An exploration of cosmology, black holes, and the nature of time.' },
      { id: 'b7', title: 'The Origin of Species', author: 'Charles Darwin', coverUrl: '', difficulty: 4, isFree: true, wordCount: 150000, rating: 4.4, description: 'The foundational work on evolutionary biology and natural selection.' },
      { id: 'b8', title: 'Cosmos', author: 'Carl Sagan', coverUrl: '', difficulty: 3, isFree: false, wordCount: 115000, rating: 4.7, description: 'A journey through the universe exploring science and human civilization.' },
      { id: 'b9', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: '', difficulty: 3, isFree: false, wordCount: 135000, rating: 4.5, description: 'A brief history of humankind from the Stone Age to the present.' },
      { id: 'b10', title: 'The Selfish Gene', author: 'Richard Dawkins', coverUrl: '', difficulty: 4, isFree: false, wordCount: 90000, rating: 4.3, description: 'A revolutionary look at evolution from the perspective of genes.' },
    ],
  },
];

// Combine all books for "All Books" section
const ALL_BOOKS = MOCK_BOOK_LISTS.flatMap((list) => list.books);

// --- Types ---

type DisplayBook = Book | SearchBook | MockBook;

interface MockBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  difficulty: number;
  isFree: boolean;
  wordCount?: number;
  rating?: number;
  description?: string;
}

interface BannerItem {
  id: string;
  titleKey: string;
  subtitle: string;
  bookCount: number;
  bgColor: string;
  icon: string;
  typeBadge: string;
}

// --- Ranking Badge Colors ---
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

// --- Difficulty Colors ---
const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#6ED6A8',
  2: '#7BAAFF',
  3: '#FFC26A',
  4: '#FF6B6B',
  5: '#9A8CF2',
};

// --- Banner Carousel Component ---

const BannerCarousel = memo(function BannerCarousel() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const BANNER_WIDTH = width - 32;
  const BANNER_HEIGHT = 150;

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
    ({ item }: { item: BannerItem }) => {
      return (
        <View
          style={[
            styles.bannerItem,
            {
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
            },
          ]}
        >
          <View style={[styles.bannerGradient, { backgroundColor: item.bgColor }]}>
            {/* Decorative icon */}
            <View style={styles.bannerDecorativeIcon}>
              <Ionicons name={item.icon as any} size={70} color="rgba(255, 255, 255, 0.12)" />
            </View>
            <View style={styles.bannerContent}>
              {/* Type badge */}
              <View style={styles.bannerTypeBadge}>
                <Text style={styles.bannerTypeBadgeText}>{item.typeBadge}</Text>
              </View>
              {/* Title */}
              <Text style={styles.bannerTitle}>{t(`discover.${item.titleKey}`)}</Text>
              {/* Subtitle */}
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              {/* Book count */}
              <Text style={styles.bannerBookCount}>
                {t('discover.heroBannerBooks', { count: item.bookCount })}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [BANNER_WIDTH, BANNER_HEIGHT, t]
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
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

// --- Category Menu Component ---

const CategoryMenu = memo(function CategoryMenu() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleCategoryPress = useCallback((key: string) => {
    router.push(`/category/${key}` as any);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScrollContent}
      style={styles.categoryScrollContainer}
    >
      {CATEGORY_MENU.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          style={styles.categoryMenuItem}
          onPress={() => handleCategoryPress(cat.key)}
        >
          <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + '1A' }]}>
            <Ionicons name={cat.icon as any} size={20} color={colors.primary} />
          </View>
          <Text style={[styles.categoryMenuLabel, { color: colors.text }]} numberOfLines={1}>
            {t(`discover.${cat.labelKey}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

// --- Ranked Book Card (for Must-Read Classics) ---

interface RankedBookCardProps {
  book: MockBook;
  rank: number;
  onPress: () => void;
}

const RankedBookCard = memo(function RankedBookCard({ book, rank, onPress }: RankedBookCardProps) {
  const { colors } = useTheme();
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.textTertiary;

  return (
    <TouchableOpacity style={styles.rankedBookCard} onPress={onPress}>
      <View style={styles.rankedBookCoverContainer}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.rankedBookCover} resizeMode="cover" />
        ) : (
          <View style={[styles.rankedBookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
        )}
        {/* Rank overlay */}
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          <Text style={styles.rankBadgeText}>{rank}</Text>
        </View>
      </View>
      <Text style={[styles.rankedBookTitle, { color: colors.text }]} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={[styles.rankedBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
});

// --- Standard Book Card (for Science & Discovery) ---

interface StandardBookCardProps {
  book: MockBook;
  onPress: () => void;
}

const StandardBookCard = memo(function StandardBookCard({ book, onPress }: StandardBookCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.standardBookCard} onPress={onPress}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.standardBookCover} resizeMode="cover" />
      ) : (
        <View style={[styles.standardBookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="book" size={24} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.standardBookTitle, { color: colors.text }]} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={[styles.standardBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
});

// --- Section Header ---

interface SectionHeaderProps {
  icon: string;
  title: string;
  onSeeAll: () => void;
}

const SectionHeader = memo(function SectionHeader({ icon, title, onSeeAll }: SectionHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
        <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('discover.seeAll')}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
});

// --- Book List Section (Horizontal Carousel) ---

interface BookListSectionProps {
  listId: string;
  titleKey: string;
  books: MockBook[];
  isRanked: boolean;
}

const BookListSection = memo(function BookListSection({ listId, titleKey, books, isRanked }: BookListSectionProps) {
  const { t } = useTranslation();
  const icon = isRanked ? 'trophy' : 'flask';

  const handleSeeAll = useCallback(() => {
    router.push(`/book-list/${listId}` as any);
  }, [listId]);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  return (
    <View style={styles.bookListSection}>
      <SectionHeader
        icon={icon}
        title={t(`discover.${titleKey}`)}
        onSeeAll={handleSeeAll}
      />
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bookListScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) =>
          isRanked ? (
            <RankedBookCard
              book={item}
              rank={index + 1}
              onPress={() => handleBookPress(item.id)}
            />
          ) : (
            <StandardBookCard
              book={item}
              onPress={() => handleBookPress(item.id)}
            />
          )
        }
      />
    </View>
  );
});

// --- Book Row (for All Books vertical list) ---

interface BookRowProps {
  book: MockBook;
  onPress: () => void;
  showDivider: boolean;
}

const BookRow = memo(function BookRow({ book, onPress, showDivider }: BookRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const difficultyColor = DIFFICULTY_COLORS[book.difficulty] || colors.textTertiary;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.bookRow}>
        {/* Cover */}
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.bookRowCover} resizeMode="cover" />
        ) : (
          <View style={[styles.bookRowCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
        )}
        {/* Info */}
        <View style={styles.bookRowInfo}>
          <Text style={[styles.bookRowTitle, { color: colors.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.bookRowAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            {book.author}
          </Text>
          {book.description ? (
            <Text
              style={[styles.bookRowDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {book.description}
            </Text>
          ) : null}
          {/* Metadata row */}
          <View style={styles.bookRowMeta}>
            {book.wordCount ? (
              <View style={styles.bookRowMetaItem}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.bookRowMetaText, { color: colors.textTertiary }]}>
                  {t('discover.words', { count: Math.round(book.wordCount / 1000) + 'k' })}
                </Text>
              </View>
            ) : null}
            {book.rating ? (
              <View style={styles.bookRowMetaItem}>
                <Ionicons name="star" size={12} color="#FFA500" />
                <Text style={[styles.bookRowMetaText, { color: colors.textTertiary }]}>
                  {book.rating}
                </Text>
              </View>
            ) : null}
            <View style={styles.bookRowMetaItem}>
              <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            </View>
          </View>
        </View>
      </View>
      {showDivider && (
        <View style={[styles.bookRowDivider, { backgroundColor: colors.borderLight }]} />
      )}
    </TouchableOpacity>
  );
});

// --- All Books Section ---

const AllBooksSection = memo(function AllBooksSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  return (
    <View style={styles.allBooksSection}>
      {/* Section header with divider */}
      <View style={styles.allBooksSectionHeader}>
        <Text style={[styles.allBooksSectionTitle, { color: colors.text }]}>
          {t('discover.allBooks')}
        </Text>
        <View style={[styles.allBooksDivider, { backgroundColor: colors.borderLight }]} />
      </View>
      {/* Book rows */}
      {ALL_BOOKS.map((book, index) => (
        <BookRow
          key={book.id}
          book={book}
          onPress={() => handleBookPress(book.id)}
          showDivider={index < ALL_BOOKS.length - 1}
        />
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearchBarPress = useCallback(() => {
    setIsSearchActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    inputRef.current?.blur();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Active Mode */}
      {isSearchActive ? (
        <>
          {/* Active Search Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSearchClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, styles.headerTitleCompact, { color: colors.text }]}>
              {t('discover.title')}
            </Text>
          </View>
          {/* Active Search Bar (real TextInput) */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('discover.searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {searchQuery.length === 0 && (
              <TouchableOpacity onPress={handleSearchClose}>
                <Text style={[styles.cancelText, { color: colors.primary }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <SearchPage
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            onClose={handleSearchClose}
          />
        </>
      ) : (
        <>
          {/* Normal Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('discover.title')}
            </Text>
          </View>

          {/* Fake Search Bar (button) */}
          <TouchableOpacity
            style={[styles.fakeSearchBar, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleSearchBarPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.fakeSearchBarText, { color: colors.textTertiary }]}>
              {t('discover.searchPlaceholder')}
            </Text>
          </TouchableOpacity>

          {/* Main Content */}
          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
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
                titleKey={list.titleKey}
                books={list.books}
                isRanked={list.isRanked}
              />
            ))}

            {/* All Books Section */}
            <AllBooksSection />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </>
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
  // Fake search bar (button)
  fakeSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  fakeSearchBarText: {
    fontSize: 16,
  },
  // Active search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerDecorativeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -35,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  bannerTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  bannerBookCount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Category Menu
  categoryScrollContainer: {
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryMenuItem: {
    width: 64,
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryMenuLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
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
  // Book List Section
  bookListSection: {
    marginBottom: 24,
  },
  bookListScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Ranked Book Card
  rankedBookCard: {
    width: 120,
  },
  rankedBookCoverContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  rankedBookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  rankedBookCoverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rankedBookTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    width: 100,
  },
  rankedBookAuthor: {
    fontSize: 11,
    width: 100,
  },
  // Standard Book Card
  standardBookCard: {
    width: 120,
  },
  standardBookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  standardBookCoverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  standardBookTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    width: 100,
  },
  standardBookAuthor: {
    fontSize: 11,
    width: 100,
  },
  // All Books Section
  allBooksSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  allBooksSectionHeader: {
    marginBottom: 12,
  },
  allBooksSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  allBooksDivider: {
    height: StyleSheet.hairlineWidth,
  },
  // Book Row
  bookRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  bookRowCover: {
    width: 70,
    height: 105,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookRowCoverPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookRowInfo: {
    flex: 1,
    paddingTop: 2,
  },
  bookRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookRowAuthor: {
    fontSize: 12,
    marginBottom: 4,
  },
  bookRowDescription: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 8,
  },
  bookRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookRowMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookRowMetaText: {
    fontSize: 11,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bookRowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 82,
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
