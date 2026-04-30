import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useSeriesDetail } from '../hooks/useSeries';
import { SeriesBook } from '@/services/api/series';

const COVER_W = 110;
const COVER_H = 160;

interface StackedCoversProps {
  books: SeriesBook[];
}

function StackedCovers({ books }: StackedCoversProps) {
  const { colors } = useTheme();
  const previewBooks = books.slice(0, 3);

  return (
    <View style={styles.coversWrap}>
      {previewBooks
        .slice()
        .reverse()
        .map((book, reversedIdx) => {
          const idx = previewBooks.length - 1 - reversedIdx;
          const offsetX = (idx - 1) * 32;
          const rotation = (idx - 1) * 6;
          const url = book.coverThumbUrl ?? book.coverUrl;

          return (
            <View
              key={book.id}
              style={[
                styles.coverItem,
                {
                  transform: [
                    { translateX: offsetX },
                    { rotate: `${rotation}deg` },
                  ],
                },
              ]}
            >
              {url ? (
                <Image source={{ uri: url }} style={styles.coverImage} />
              ) : (
                <View
                  style={[
                    styles.coverImage,
                    styles.coverPlaceholder,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Ionicons name="book" size={32} color={colors.primary} />
                </View>
              )}
            </View>
          );
        })}
    </View>
  );
}

interface SeriesBookRowProps {
  book: SeriesBook;
  showDivider: boolean;
  onPress: () => void;
}

function SeriesBookRow({ book, showDivider, onPress }: SeriesBookRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const url = book.coverThumbUrl ?? book.coverUrl;

  const wordCountLabel =
    book.wordCount && book.wordCount > 0
      ? book.wordCount >= 1000
        ? t('series.wordsK', { count: Math.floor(book.wordCount / 1000) })
        : t('series.words', { count: book.wordCount })
      : null;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {url ? (
        <Image source={{ uri: url }} style={styles.rowCover} />
      ) : (
        <View
          style={[
            styles.rowCover,
            styles.coverPlaceholder,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Ionicons name="book" size={20} color={colors.primary} />
        </View>
      )}

      <View style={styles.rowInfo}>
        <View style={styles.titleLine}>
          {book.seriesPosition != null && (
            <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.positionText, { color: colors.onPrimary }]}>
                #{book.seriesPosition}
              </Text>
            </View>
          )}
          <Text
            style={[styles.rowTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {book.title}
          </Text>
        </View>

        {book.author && (
          <Text
            style={[styles.rowAuthor, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {book.author}
          </Text>
        )}

        <View style={styles.metaRow}>
          {book.goodreadsRating != null && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={10} color="#FB8C00" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {book.goodreadsRating.toFixed(2)}
              </Text>
            </View>
          )}
          {wordCountLabel && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {wordCountLabel}
            </Text>
          )}
          {book.hasAudiobook && (
            <Ionicons name="headset" size={10} color={colors.textSecondary} />
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />

      {showDivider && (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      )}
    </TouchableOpacity>
  );
}

export function SeriesDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data, isLoading, error } = useSeriesDetail(id ?? '');

  const handleBookPress = useCallback((bookId: string) => {
    router.push(`/book/${bookId}`);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: data?.name ?? name ?? t('series.title', { defaultValue: 'Series' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !data ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {t('series.loadError', { defaultValue: 'Failed to load series' })}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
            <StackedCovers books={data.books} />

            {data.authorName && (
              <Text style={[styles.authorName, { color: colors.text }]}>
                {data.authorName}
              </Text>
            )}

            {data.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {data.description}
              </Text>
            )}

            <View style={[styles.countBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                {t('series.booksInSeries', { count: data.bookCount })}
              </Text>
            </View>
          </View>

          <View style={[styles.booksList, { backgroundColor: colors.surface }]}>
            {data.books.map((book, idx) => (
              <SeriesBookRow
                key={book.id}
                book={book}
                showDivider={idx < data.books.length - 1}
                onPress={() => handleBookPress(book.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 16,
  },
  headerCard: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  coversWrap: {
    height: COVER_H + 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  coverItem: {
    position: 'absolute',
  },
  coverImage: {
    width: COVER_W,
    height: COVER_H,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  countBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  booksList: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    position: 'relative',
  },
  rowCover: {
    width: 50,
    height: 72,
    borderRadius: 6,
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flexWrap: 'wrap',
  },
  positionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  rowAuthor: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 88,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
