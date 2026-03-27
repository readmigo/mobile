import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useHighlightStore, Bookmark } from '../stores/highlightStore';

interface BookmarkPanelProps {
  bookId: string;
  sheetRef: React.RefObject<BottomSheet | null>;
  onNavigateToCfi: (cfi: string) => void;
}

export function BookmarkPanel({ bookId, sheetRef, onNavigateToCfi }: BookmarkPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const bookmarks = useHighlightStore((s) => s.getBookBookmarks(bookId));
  const removeBookmark = useHighlightStore((s) => s.removeBookmark);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const sortedBookmarks = useMemo(
    () => [...bookmarks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookmarks],
  );

  const handlePress = useCallback(
    (bookmark: Bookmark) => {
      if (bookmark.cfiPath) {
        onNavigateToCfi(bookmark.cfiPath);
        sheetRef.current?.close();
      }
    },
    [onNavigateToCfi, sheetRef],
  );

  const handleDelete = useCallback(
    (bookmark: Bookmark) => {
      Alert.alert(
        t('reader.deleteBookmark', { defaultValue: 'Delete Bookmark' }),
        t('reader.deleteBookmarkConfirm', { defaultValue: 'Are you sure?' }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete', { defaultValue: 'Delete' }),
            style: 'destructive',
            onPress: () => removeBookmark(bookId, bookmark.id),
          },
        ],
      );
    },
    [bookId, removeBookmark, t],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = useCallback(
    ({ item }: { item: Bookmark }) => (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.surface }]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Ionicons name="bookmark" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemContent}>
          {item.title && (
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
          )}
          {item.note && (
            <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.note}
            </Text>
          )}
          <Text style={[styles.itemDate, { color: colors.textTertiary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [colors, handlePress, handleDelete],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('reader.bookmarks', { defaultValue: 'Bookmarks' })}
          </Text>
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {sortedBookmarks.length}
          </Text>
        </View>

        {sortedBookmarks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('reader.noBookmarks', { defaultValue: 'No bookmarks yet' })}
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedBookmarks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  count: {
    fontSize: 14,
  },
  list: {
    gap: 8,
    paddingBottom: 32,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 13,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
