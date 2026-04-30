import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  useHighlightStore,
  Bookmark,
  Highlight,
  HIGHLIGHT_COLORS,
} from '@/features/reader/stores/highlightStore';
import { useUserLibrary } from '@/features/library/hooks/useLibrary';

type FilterKind = 'all' | 'bookmark' | 'highlight' | 'note';

type Item =
  | { kind: 'bookmark'; data: Bookmark }
  | { kind: 'highlight'; data: Highlight };

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  accent: string;
}

function FilterChip({ label, count, active, onPress, accent }: FilterChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? accent : colors.surface,
          borderColor: active ? accent : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipLabel,
          {
            color: active ? '#fff' : colors.text,
            fontWeight: active ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.chipBadge,
            {
              backgroundColor: active ? 'rgba(255,255,255,0.3)' : accent + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.chipBadgeText,
              { color: active ? '#fff' : accent },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function timeAgo(dateStr: string, t: (k: string, opts?: any) => string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return t('common.justNow', { defaultValue: 'Just now' });
  if (min < 60) return t('common.minutesAgo', { count: min, defaultValue: `${min}m ago` });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('common.hoursAgo', { count: hr, defaultValue: `${hr}h ago` });
  const day = Math.floor(hr / 24);
  if (day < 30) return t('common.daysAgo', { count: day, defaultValue: `${day}d ago` });
  return new Date(dateStr).toLocaleDateString();
}

interface RowProps {
  item: Item;
  bookTitle: string;
  onPress: () => void;
  onDelete: () => void;
}

function BookmarkRow({ item, bookTitle, onPress, onDelete }: RowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const isBookmark = item.kind === 'bookmark';
  const data = item.data;
  const note = data.note;
  const highlightColor = !isBookmark ? (data as Highlight).color : null;
  const selectedText = !isBookmark ? (data as Highlight).selectedText : null;
  const title = isBookmark ? (data as Bookmark).title : null;

  const iconName = isBookmark ? 'bookmark' : note ? 'document-text' : 'brush';
  const iconColor = isBookmark
    ? colors.primary
    : highlightColor
      ? HIGHLIGHT_COLORS[highlightColor].underline
      : colors.primary;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View style={styles.rowContent}>
        <Text
          style={[styles.rowBookTitle, { color: colors.textTertiary }]}
          numberOfLines={1}
        >
          {bookTitle}
        </Text>

        {selectedText ? (
          <View
            style={[
              styles.highlightBadge,
              {
                backgroundColor: highlightColor
                  ? HIGHLIGHT_COLORS[highlightColor].bg
                  : 'rgba(255,235,59,0.3)',
              },
            ]}
          >
            <Text
              style={[styles.highlightText, { color: colors.text }]}
              numberOfLines={2}
            >
              {selectedText}
            </Text>
          </View>
        ) : title ? (
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
        ) : null}

        {note && (
          <Text
            style={[styles.rowNote, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {note}
          </Text>
        )}

        <Text style={[styles.rowDate, { color: colors.textTertiary }]}>
          {timeAgo(data.createdAt, t)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export function BookmarksScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const highlightsMap = useHighlightStore((s) => s.highlights);
  const bookmarksMap = useHighlightStore((s) => s.bookmarks);
  const removeHighlight = useHighlightStore((s) => s.removeHighlight);
  const removeBookmark = useHighlightStore((s) => s.removeBookmark);

  const { data: library } = useUserLibrary();

  const bookTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    library?.forEach((ub) => {
      m.set(ub.bookId, ub.book.title ?? '');
    });
    return m;
  }, [library]);

  const allItems = useMemo<Item[]>(() => {
    const items: Item[] = [];
    Object.values(bookmarksMap).forEach((arr) => {
      arr.forEach((b) => items.push({ kind: 'bookmark', data: b }));
    });
    Object.values(highlightsMap).forEach((arr) => {
      arr.forEach((h) => items.push({ kind: 'highlight', data: h }));
    });
    items.sort(
      (a, b) =>
        new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    );
    return items;
  }, [bookmarksMap, highlightsMap]);

  const counts = useMemo(() => {
    let bookmark = 0;
    let highlight = 0;
    let note = 0;
    allItems.forEach((it) => {
      if (it.kind === 'bookmark') bookmark += 1;
      else {
        highlight += 1;
        if (it.data.note && it.data.note.length > 0) note += 1;
      }
    });
    return { all: allItems.length, bookmark, highlight, note };
  }, [allItems]);

  const [filter, setFilter] = useState<FilterKind>('all');
  const [searchText, setSearchText] = useState('');

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (filter === 'bookmark') {
      items = items.filter((it) => it.kind === 'bookmark');
    } else if (filter === 'highlight') {
      items = items.filter((it) => it.kind === 'highlight');
    } else if (filter === 'note') {
      items = items.filter((it) => it.data.note && it.data.note.length > 0);
    }

    const query = searchText.trim().toLowerCase();
    if (query) {
      items = items.filter((it) => {
        const note = it.data.note?.toLowerCase() ?? '';
        const text =
          it.kind === 'highlight'
            ? (it.data as Highlight).selectedText.toLowerCase()
            : '';
        const title =
          it.kind === 'bookmark' ? (it.data as Bookmark).title?.toLowerCase() ?? '' : '';
        const bookTitle =
          (bookTitleMap.get(it.data.bookId) ?? '').toLowerCase();
        return (
          note.includes(query) ||
          text.includes(query) ||
          title.includes(query) ||
          bookTitle.includes(query)
        );
      });
    }

    return items;
  }, [allItems, filter, searchText, bookTitleMap]);

  const handleRowPress = useCallback((item: Item) => {
    const cfi = item.data.cfiPath;
    if (!cfi) {
      Alert.alert(
        t('bookmarks.cantNavigate.title', { defaultValue: 'Cannot navigate' }),
        t('bookmarks.cantNavigate.message', {
          defaultValue: 'This entry has no saved position.',
        })
      );
      return;
    }
    router.push({
      pathname: '/book/reader',
      params: { bookId: item.data.bookId, initialCfi: cfi },
    });
  }, [t]);

  const handleDelete = useCallback(
    (item: Item) => {
      Alert.alert(
        t('bookmarks.deleteTitle', { defaultValue: 'Delete' }),
        t('bookmarks.deleteConfirm', {
          defaultValue: 'Remove this entry permanently?',
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              if (item.kind === 'bookmark') {
                removeBookmark(item.data.bookId, item.data.id);
              } else {
                removeHighlight(item.data.bookId, item.data.id);
              }
            },
          },
        ]
      );
    },
    [removeBookmark, removeHighlight, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <BookmarkRow
        item={item}
        bookTitle={bookTitleMap.get(item.data.bookId) ?? ''}
        onPress={() => handleRowPress(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [bookTitleMap, handleRowPress, handleDelete]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('bookmarks.title', { defaultValue: 'Bookmarks' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('bookmarks.searchPrompt', { defaultValue: 'Search bookmarks' })}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <FilterChip
          label={t('common.all', { defaultValue: 'All' })}
          count={counts.all}
          active={filter === 'all'}
          accent={colors.primary}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label={t('bookmarks.filter.bookmark', { defaultValue: 'Bookmarks' })}
          count={counts.bookmark}
          active={filter === 'bookmark'}
          accent="#4285F4"
          onPress={() => setFilter('bookmark')}
        />
        <FilterChip
          label={t('bookmarks.filter.highlight', { defaultValue: 'Highlights' })}
          count={counts.highlight}
          active={filter === 'highlight'}
          accent="#FB8C00"
          onPress={() => setFilter('highlight')}
        />
        <FilterChip
          label={t('bookmarks.filter.note', { defaultValue: 'Notes' })}
          count={counts.note}
          active={filter === 'note'}
          accent="#43A047"
          onPress={() => setFilter('note')}
        />
      </ScrollView>

      {filteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name={searchText ? 'search-outline' : 'bookmark-outline'}
            size={48}
            color={colors.textTertiary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchText
              ? t('bookmarks.empty.search', { defaultValue: 'No matches found' })
              : t('bookmarks.empty.all', { defaultValue: 'No bookmarks yet' })}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {searchText
              ? t('bookmarks.empty.searchHint', { defaultValue: 'Try a different keyword' })
              : t('bookmarks.empty.allHint', {
                  defaultValue: 'Save bookmarks and highlights while reading',
                })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.kind}-${item.data.id}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  chipLabel: {
    fontSize: 13,
  },
  chipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowBookTitle: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  rowDate: {
    fontSize: 11,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
