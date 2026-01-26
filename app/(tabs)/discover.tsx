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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { TabView, TabBar, Route } from 'react-native-tab-view';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useSearchBooks, useBooks, SearchBook } from '@/features/books';
import type { Book } from '@/services/api/books';

const CATEGORIES = [
  { key: 'all', title: 'All' },
  { key: 'classics', title: 'Classics' },
  { key: 'fiction', title: 'Fiction' },
  { key: 'non-fiction', title: 'Non-Fiction' },
  { key: 'biography', title: 'Biography' },
  { key: 'science', title: 'Science' },
];

// Banner data - can be fetched from API later
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

type DisplayBook = Book | SearchBook;

interface BookCardProps {
  book: DisplayBook;
  onPress: () => void;
}

const BookCard = memo(function BookCard({ book, onPress }: BookCardProps) {
  const { colors } = useTheme();
  const difficulty = 'difficulty' in book ? book.difficulty : (book.difficultyScore ?? 0);
  const isFree = 'isFree' in book ? book.isFree : true;

  return (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="book" size={24} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
      <View style={styles.bookMeta}>
        <View style={styles.difficultyContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.difficultyDot,
                {
                  backgroundColor:
                    i < difficulty ? colors.primary : colors.border,
                },
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

// Banner Carousel Component
interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  gradient: string[];
  icon: string;
}

const BannerCarousel = memo(function BannerCarousel() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const BANNER_WIDTH = width - 32;
  const BANNER_HEIGHT = 140;

  // Auto scroll
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
          <View
            style={[
              styles.bannerGradient,
              {
                backgroundColor: item.gradient[0],
              },
            ]}
          >
            {/* Decorative circles */}
            <View style={[styles.bannerCircle, styles.bannerCircle1, { backgroundColor: item.gradient[1] + '40' }]} />
            <View style={[styles.bannerCircle, styles.bannerCircle2, { backgroundColor: item.gradient[1] + '30' }]} />

            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.bannerIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={48}
                  color="rgba(255, 255, 255, 0.9)"
                />
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

      {/* Pagination dots */}
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
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
});

interface CategoryTabProps {
  category: string;
  showBanner?: boolean;
}

const CategoryTab = memo(function CategoryTab({ category, showBanner = false }: CategoryTabProps) {
  const { colors } = useTheme();

  const { data: books, isLoading } = useBooks({
    category: category === 'all' ? undefined : category,
    pageSize: 20,
  });

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!books || books.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No books in this category
        </Text>
      </View>
    );
  }

  return (
    <FlashList<DisplayBook>
      data={books}
      renderItem={({ item }) => (
        <BookCard book={item} onPress={() => handleBookPress(item.id)} />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={showBanner ? <BannerCarousel /> : null}
    />
  );
});

interface SearchResultsProps {
  query: string;
}

const SearchResults = memo(function SearchResults({ query }: SearchResultsProps) {
  const { colors } = useTheme();
  const { data: searchResults, isLoading } = useSearchBooks(query);

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No books found for "{query}"
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.searchResultsContainer}>
      <View style={styles.searchInfo}>
        <Text style={[styles.searchInfoText, { color: colors.textSecondary }]}>
          {searchResults.length} results for "{query}"
        </Text>
      </View>
      <FlashList<DisplayBook>
        data={searchResults}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => handleBookPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

type CategoryRoute = Route & { key: string; title: string };

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [routes] = useState<CategoryRoute[]>(CATEGORIES);

  const deferredQuery = useDeferredValue(searchQuery);
  const isSearching = deferredQuery.length > 1;

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const renderScene = useCallback(
    ({ route }: { route: CategoryRoute }) => {
      // Show banner only on the "All" tab
      return <CategoryTab category={route.key} showBanner={route.key === 'all'} />;
    },
    []
  );

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        scrollEnabled
        style={[styles.tabBar, { backgroundColor: colors.background }]}
        tabStyle={styles.tab}
        indicatorStyle={[styles.indicator, { backgroundColor: colors.primary }]}
        renderLabel={({ route, focused }: { route: CategoryRoute; focused: boolean }) => (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? colors.primary : colors.textSecondary },
            ]}
          >
            {route.title}
          </Text>
        )}
        pressColor={colors.primary + '20'}
      />
    ),
    [colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search books..."
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
      </View>

      {/* Tab View or Search Results */}
      {isSearching ? (
        <SearchResults query={deferredQuery} />
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          lazy
          lazyPreloadDistance={1}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabBar: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  tab: {
    width: 'auto',
    paddingHorizontal: 16,
  },
  indicator: {
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'none',
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
  // Other styles
  searchResultsContainer: {
    flex: 1,
  },
  searchInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInfoText: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
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
});
