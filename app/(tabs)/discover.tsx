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
import { useSearchBooks, useBookLists, useBooks, useCategories, SearchBook } from '@/features/books';
import type { BookList, BookListBook, BookListType } from '@/services/api/bookLists';
import type { Book } from '@/services/api/books';

// --- Type-based color & icon mappings (matching iOS BookListType) ---

const LIST_TYPE_COLORS: Record<string, string> = {
  RANKING: '#C0392B',
  EDITORS_PICK: '#5B4A9E',
  COLLECTION: '#2D8B7B',
  UNIVERSITY: '#3B3B8B',
  CELEBRITY: '#A0456C',
  ANNUAL_BEST: '#C87B2D',
  AI_RECOMMENDED: '#6A4B9E',
  PERSONALIZED: '#C04060',
  AI_FEATURED: '#2D7B8B',
};

const LIST_TYPE_ICONS: Record<string, string> = {
  RANKING: 'trophy',
  EDITORS_PICK: 'star',
  COLLECTION: 'library',
  UNIVERSITY: 'school',
  CELEBRITY: 'people',
  ANNUAL_BEST: 'ribbon',
  AI_RECOMMENDED: 'sparkles',
  PERSONALIZED: 'heart',
  AI_FEATURED: 'flash',
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  fiction: 'book',
  'non-fiction': 'document-text',
  classics: 'library',
  science: 'flask',
  biography: 'person',
  philosophy: 'bulb',
  poetry: 'musical-notes',
  history: 'time',
  adventure: 'compass',
  romance: 'heart',
  'self-help': 'sunny',
  business: 'briefcase',
  technology: 'hardware-chip',
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#6ED6A8',
  2: '#7BAAFF',
  3: '#FFC26A',
  4: '#FF6B6B',
  5: '#9A8CF2',
};

// --- Helper ---

function getBookCoverUrl(book: { coverUrl?: string; coverThumbUrl?: string }): string | undefined {
  return book.coverThumbUrl || book.coverUrl || undefined;
}

function getListColor(type?: string): string {
  return (type && LIST_TYPE_COLORS[type]) || '#4A6CF7';
}

function getListIcon(type?: string): string {
  return (type && LIST_TYPE_ICONS[type]) || 'library';
}

function getCategoryIcon(name: string): string {
  return CATEGORY_ICON_MAP[name.toLowerCase()] || 'bookmark-outline';
}

// --- Banner Carousel ---

interface BannerCarouselProps {
  bookLists: BookList[];
}

const BannerCarousel = memo(function BannerCarousel({ bookLists }: BannerCarouselProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  const bannerItems = bookLists.slice(0, 4);
  const BANNER_WIDTH = width - 32;
  const BANNER_HEIGHT = 150;

  useEffect(() => {
    if (bannerItems.length <= 1) return;
    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % bannerItems.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, 4000);
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [activeIndex, BANNER_WIDTH, bannerItems.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  const renderBannerItem = useCallback(
    ({ item }: { item: BookList }) => {
      const bgColor = getListColor(item.type);
      const icon = getListIcon(item.type);
      return (
        <TouchableOpacity
          style={[styles.bannerItem, { width: BANNER_WIDTH, height: BANNER_HEIGHT }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/book-list/${item.id}` as any)}
        >
          <View style={[styles.bannerGradient, { backgroundColor: bgColor }]}>
            <View style={styles.bannerDecorativeIcon}>
              <Ionicons name={icon as any} size={70} color="rgba(255, 255, 255, 0.12)" />
            </View>
            <View style={styles.bannerContent}>
              <View style={styles.bannerTypeBadge}>
                <Text style={styles.bannerTypeBadgeText}>
                  {item.type?.replace(/_/g, ' ') || 'Collection'}
                </Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.bannerSubtitle} numberOfLines={1}>{item.subtitle}</Text>
              ) : null}
              <Text style={styles.bannerBookCount}>
                {t('discover.heroBannerBooks', { count: item.bookCount })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [BANNER_WIDTH, BANNER_HEIGHT, t],
  );

  if (bannerItems.length === 0) return null;

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={bannerItems}
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
      {bannerItems.length > 1 && (
        <View style={styles.paginationContainer}>
          {bannerItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    index === activeIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

// --- Category Menu ---

interface CategoryMenuProps {
  categories: string[];
}

const CategoryMenu = memo(function CategoryMenu({ categories }: CategoryMenuProps) {
  const { colors } = useTheme();

  const handleCategoryPress = useCallback((key: string) => {
    router.push(`/category/${key}` as any);
  }, []);

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScrollContent}
      style={styles.categoryScrollContainer}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={styles.categoryMenuItem}
          onPress={() => handleCategoryPress(cat)}
        >
          <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + '1A' }]}>
            <Ionicons name={getCategoryIcon(cat) as any} size={20} color={colors.primary} />
          </View>
          <Text style={[styles.categoryMenuLabel, { color: colors.text }]} numberOfLines={1}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

// --- Ranked Book Card ---

interface RankedBookCardProps {
  book: BookListBook;
  rank: number;
  onPress: () => void;
}

const RankedBookCard = memo(function RankedBookCard({ book, rank, onPress }: RankedBookCardProps) {
  const { colors } = useTheme();
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.textTertiary;
  const coverUrl = getBookCoverUrl(book);

  return (
    <TouchableOpacity style={styles.rankedBookCard} onPress={onPress}>
      <View style={styles.rankedBookCoverContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.rankedBookCover} resizeMode="cover" />
        ) : (
          <View style={[styles.rankedBookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
        )}
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

// --- Standard Book Card ---

interface StandardBookCardProps {
  book: BookListBook;
  onPress: () => void;
}

const StandardBookCard = memo(function StandardBookCard({ book, onPress }: StandardBookCardProps) {
  const { colors } = useTheme();
  const coverUrl = getBookCoverUrl(book);

  return (
    <TouchableOpacity style={styles.standardBookCard} onPress={onPress}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.standardBookCover} resizeMode="cover" />
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
  bookList: BookList;
}

const BookListSection = memo(function BookListSection({ bookList }: BookListSectionProps) {
  const isRanked = bookList.type === 'RANKING';
  const icon = getListIcon(bookList.type);
  const books = bookList.books || [];

  const handleSeeAll = useCallback(() => {
    router.push(`/book-list/${bookList.id}` as any);
  }, [bookList.id]);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  if (books.length === 0) return null;

  return (
    <View style={styles.bookListSection}>
      <SectionHeader icon={icon} title={bookList.title} onSeeAll={handleSeeAll} />
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
            <StandardBookCard book={item} onPress={() => handleBookPress(item.id)} />
          )
        }
      />
    </View>
  );
});

// --- Book Row (for All Books vertical list) ---

interface BookRowProps {
  book: Book;
  onPress: () => void;
  showDivider: boolean;
}

const BookRow = memo(function BookRow({ book, onPress, showDivider }: BookRowProps) {
  const { colors } = useTheme();
  const difficultyColor = DIFFICULTY_COLORS[book.difficulty] || colors.textTertiary;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.bookRow}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.bookRowCover} resizeMode="cover" />
        ) : (
          <View style={[styles.bookRowCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
        )}
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
          <View style={styles.bookRowMeta}>
            <View style={styles.bookRowMetaItem}>
              <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            </View>
            {book.isFree && (
              <View style={[styles.freeBadge, { backgroundColor: '#6ED6A8' + '30' }]}>
                <Text style={[styles.freeText, { color: '#6ED6A8' }]}>Free</Text>
              </View>
            )}
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

interface AllBooksSectionProps {
  books: Book[];
}

const AllBooksSection = memo(function AllBooksSection({ books }: AllBooksSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  if (books.length === 0) return null;

  return (
    <View style={styles.allBooksSection}>
      <View style={styles.allBooksSectionHeader}>
        <Text style={[styles.allBooksSectionTitle, { color: colors.text }]}>
          {t('discover.allBooks')}
        </Text>
        <View style={[styles.allBooksDivider, { backgroundColor: colors.borderLight }]} />
      </View>
      {books.map((book, index) => (
        <BookRow
          key={book.id}
          book={book}
          onPress={() => handleBookPress(book.id)}
          showDivider={index < books.length - 1}
        />
      ))}
    </View>
  );
});

// --- Search Page ---

interface SearchPageProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
}

const SearchPage = memo(function SearchPage({ query, onChangeQuery }: SearchPageProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const deferredQuery = useDeferredValue(query);
  const isSearching = deferredQuery.length > 1;
  const { data: searchResults, isLoading } = useSearchBooks(deferredQuery);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

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
          {searchResults.map((book: SearchBook) => (
            <TouchableOpacity
              key={book.id}
              style={[styles.searchResultRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => handleBookPress(book.id)}
            >
              {book.coverUrl ? (
                <Image source={{ uri: book.coverUrl }} style={styles.searchResultCover} />
              ) : (
                <View
                  style={[
                    styles.searchResultCoverPlaceholder,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Ionicons name="book" size={16} color={colors.primary} />
                </View>
              )}
              <View style={styles.searchResultInfo}>
                <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>
                  {book.title}
                </Text>
                {book.author ? (
                  <Text
                    style={[styles.searchResultAuthor, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
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

  // Default: prompt to search
  return (
    <View style={[styles.searchPage, { backgroundColor: colors.background }]}>
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('discover.searchPlaceholder')}
        </Text>
      </View>
    </View>
  );
});

// --- Main Screen ---

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const {
    data: bookLists,
    isLoading: listsLoading,
    refetch: refetchLists,
  } = useBookLists();
  const {
    data: categories,
    isLoading: catsLoading,
    refetch: refetchCats,
  } = useCategories();
  const {
    data: allBooks,
    isLoading: booksLoading,
    refetch: refetchBooks,
  } = useBooks({ pageSize: 20 });

  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchLists(), refetchCats(), refetchBooks()]);
    setRefreshing(false);
  }, [refetchLists, refetchCats, refetchBooks]);

  const isLoading = listsLoading && catsLoading && booksLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isSearchActive ? (
        <>
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
                <Text style={[styles.cancelText, { color: colors.primary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <SearchPage query={searchQuery} onChangeQuery={setSearchQuery} onClose={handleSearchClose} />
        </>
      ) : (
        <>
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.mainScroll}
              contentContainerStyle={styles.mainScrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                />
              }
            >
              {/* Hero Banner */}
              {bookLists && bookLists.length > 0 && (
                <BannerCarousel bookLists={bookLists} />
              )}

              {/* Category Menu */}
              {categories && categories.length > 0 && (
                <CategoryMenu categories={categories} />
              )}

              {/* Book Lists */}
              {bookLists?.map((list) => (
                <BookListSection key={list.id} bookList={list} />
              ))}

              {/* All Books */}
              {allBooks && allBooks.length > 0 && <AllBooksSection books={allBooks} />}

              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
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
  // Fake search bar
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
  // Banner
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
    textTransform: 'capitalize',
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
  },
  bookRowCoverPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  bookRowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 82,
  },
  // Search Page
  searchPage: {
    flex: 1,
  },
  searchSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    width: 45,
    height: 68,
    borderRadius: 6,
    marginRight: 12,
  },
  searchResultCoverPlaceholder: {
    width: 45,
    height: 68,
    borderRadius: 6,
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
