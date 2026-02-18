import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useBookListDetail } from '@/features/books';
import type { BookListBook, BookListType } from '@/services/api/bookLists';

// --- Gradient colors per book list type (matching iOS) ---

const LIST_TYPE_GRADIENTS: Record<string, [string, string]> = {
  RANKING: ['#FF8C00', '#CC3333'],
  EDITORS_PICK: ['#4A6CF7', '#8B5CF6'],
  COLLECTION: ['#20B2AA', '#4A6CF7'],
  UNIVERSITY: ['#4B0082', '#4A6CF7'],
  CELEBRITY: ['#FF69B4', '#8B5CF6'],
  ANNUAL_BEST: ['#DAA520', '#FF8C00'],
  AI_RECOMMENDED: ['#8B5CF6', '#4A6CF7'],
  PERSONALIZED: ['#FF69B4', '#CC3333'],
  AI_FEATURED: ['#00CED1', '#8B5CF6'],
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

function getGradientColors(type?: string): [string, string] {
  return (type && LIST_TYPE_GRADIENTS[type]) || ['#4A6CF7', '#8B5CF6'];
}

function getListIcon(type?: string): string {
  return (type && LIST_TYPE_ICONS[type]) || 'library';
}

// --- Grid Item ---

interface GridItemProps {
  book: BookListBook;
  itemWidth: number;
  onPress: () => void;
}

function GridItem({ book, itemWidth, onPress }: GridItemProps) {
  const { colors } = useTheme();
  const coverUrl = book.coverThumbUrl || book.coverUrl;
  const coverHeight = itemWidth * 1.5; // 2:3 aspect ratio

  return (
    <TouchableOpacity
      style={[styles.gridItem, { width: itemWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={[styles.gridCover, { width: itemWidth, height: coverHeight }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.gridCoverPlaceholder,
            { width: itemWidth, height: coverHeight, backgroundColor: colors.primary + '15' },
          ]}
        >
          <Ionicons name="book" size={32} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>
        {book.title}
      </Text>
      <Text style={[styles.gridAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
}

// --- Main Screen ---

export default function BookListDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bookList, isLoading } = useBookListDetail(id ?? '');
  const { width } = useWindowDimensions();

  const GRID_PADDING = 16;
  const GRID_GAP = 16;
  const itemWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Book List</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!bookList) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Book List</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Book list not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const gradientColors = getGradientColors(bookList.type);
  const icon = getListIcon(bookList.type);
  const books = bookList.books || [];

  const renderGridItem = ({ item, index }: { item: BookListBook; index: number }) => (
    <View style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}>
      <GridItem
        book={item}
        itemWidth={itemWidth}
        onPress={() => handleBookPress(item.id)}
      />
    </View>
  );

  const ListHeader = () => (
    <>
      {/* Gradient Banner */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        {/* Decorative icon */}
        <View style={styles.bannerDecorativeIcon}>
          <Ionicons name={icon as any} size={80} color="rgba(255, 255, 255, 0.15)" />
        </View>

        {/* Content */}
        <View style={styles.bannerTextContent}>
          <View style={styles.bannerTypeBadge}>
            <Text style={styles.bannerTypeBadgeText}>
              {bookList.type?.replace(/_/g, ' ') || 'Collection'}
            </Text>
          </View>
          <Text style={styles.bannerTitle} numberOfLines={2}>
            {bookList.title}
          </Text>
          {bookList.subtitle ? (
            <Text style={styles.bannerSubtitle} numberOfLines={2}>
              {bookList.subtitle}
            </Text>
          ) : null}
          <View style={styles.bannerBookCount}>
            <Ionicons name="book" size={12} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.bannerBookCountText}>
              {bookList.bookCount} books
            </Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {bookList.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Grid */}
      <FlatList
        data={books}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No books in this list yet
            </Text>
          </View>
        }
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
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  // Banner
  banner: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecorativeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -40,
  },
  bannerTextContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  bannerTypeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  bannerBookCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerBookCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Grid
  gridContent: {
    paddingBottom: 32,
  },
  gridRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  gridItemLeft: {
    flex: 1,
  },
  gridItemRight: {
    flex: 1,
  },
  gridItem: {
    marginTop: 16,
  },
  gridCover: {
    borderRadius: 8,
    marginBottom: 6,
  },
  gridCoverPlaceholder: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  gridAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  // States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
