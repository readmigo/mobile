import { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { UserBook } from '@/services/api/books';
import {
  useUserLibrary,
  useRemoveFromLibrary,
} from '@/features/library/hooks/useLibrary';
import { useBookshelfStore } from '../stores/bookshelfStore';
import { BookshelfTopBar } from './BookshelfTopBar';
import { BookshelfShelfView } from './BookshelfShelfView';
import { BookshelfListView } from './BookshelfListView';
import { BookshelfEmptyView } from './BookshelfEmptyView';
import { BookshelfEditToolbar } from './BookshelfEditToolbar';

function sortItems(
  items: UserBook[],
  sortOption: ReturnType<typeof useBookshelfStore.getState>['sortOption'],
  manualOrder: string[]
): UserBook[] {
  const arr = [...items];

  switch (sortOption) {
    case 'manual': {
      if (manualOrder.length === 0) return arr;
      const indexMap = new Map<string, number>(
        manualOrder.map((id, idx) => [id, idx])
      );
      return arr.sort((a, b) => {
        const ai = indexMap.get(a.bookId) ?? Number.MAX_SAFE_INTEGER;
        const bi = indexMap.get(b.bookId) ?? Number.MAX_SAFE_INTEGER;
        return ai - bi;
      });
    }
    case 'recent':
      return arr.sort(
        (a, b) =>
          new Date(b.lastReadAt ?? 0).getTime() -
          new Date(a.lastReadAt ?? 0).getTime()
      );
    case 'title':
      return arr.sort((a, b) =>
        (a.book.title ?? '').localeCompare(b.book.title ?? '')
      );
    case 'author':
      return arr.sort((a, b) =>
        (a.book.author ?? '').localeCompare(b.book.author ?? '')
      );
    case 'addedDate':
      return arr.sort(
        (a, b) =>
          new Date(b.addedAt ?? 0).getTime() -
          new Date(a.addedAt ?? 0).getTime()
      );
    default:
      return arr;
  }
}

export function BookshelfScreen() {
  const { colors } = useTheme();
  const {
    displayMode,
    sortOption,
    manualOrder,
    toggleDisplayMode,
    setSortOption,
  } = useBookshelfStore();

  const { data: library, isLoading, refetch, isRefetching } = useUserLibrary();
  const removeMutation = useRemoveFromLibrary();

  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allItems = library ?? [];

  const filteredItems = useMemo(() => {
    const sorted = sortItems(allItems, sortOption, manualOrder);
    const query = searchText.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter((item) => {
      const title = (item.book.title ?? '').toLowerCase();
      const author = (item.book.author ?? '').toLowerCase();
      return title.includes(query) || author.includes(query);
    });
  }, [allItems, sortOption, manualOrder, searchText]);

  const toggleSelect = useCallback((bookId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  }, []);

  const handleItemPress = useCallback((item: UserBook) => {
    router.push({
      pathname: '/book/reader',
      params: { bookId: item.bookId, initialCfi: item.currentCfi ?? '' },
    });
  }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredItems.length) {
        return new Set();
      }
      return new Set(filteredItems.map((it) => it.bookId));
    });
  }, [filteredItems]);

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => removeMutation.mutateAsync(id).catch(() => null)));
    setSelectedIds(new Set());
    setIsEditMode(false);
  }, [selectedIds, removeMutation]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = allItems.length === 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <BookshelfTopBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        isSearchActive={isSearchActive}
        onSearchActiveChange={setIsSearchActive}
        displayMode={displayMode}
        onToggleDisplayMode={toggleDisplayMode}
        sortOption={sortOption}
        onSortChange={setSortOption}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        itemCount={allItems.length}
      />

      {isEmpty ? (
        <BookshelfEmptyView />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {isEditMode && (
            <BookshelfEditToolbar
              totalCount={filteredItems.length}
              selectedCount={selectedIds.size}
              allSelected={
                selectedIds.size === filteredItems.length && filteredItems.length > 0
              }
              onToggleSelectAll={handleToggleSelectAll}
              onDelete={handleBatchDelete}
            />
          )}

          {displayMode === 'shelf' ? (
            <BookshelfShelfView
              items={filteredItems}
              isEditMode={isEditMode}
              selectedIds={selectedIds}
              onItemPress={handleItemPress}
              onToggleSelect={toggleSelect}
            />
          ) : (
            <BookshelfListView
              items={filteredItems}
              isEditMode={isEditMode}
              selectedIds={selectedIds}
              onItemPress={handleItemPress}
              onToggleSelect={toggleSelect}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
});
