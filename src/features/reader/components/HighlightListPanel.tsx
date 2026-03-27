import React, { useCallback, useMemo, useState } from 'react';
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
import {
  useHighlightStore,
  Highlight,
  HighlightColor,
  HIGHLIGHT_COLORS,
} from '../stores/highlightStore';
import { NoteEditor } from './NoteEditor';

interface HighlightListPanelProps {
  bookId: string;
  sheetRef: React.RefObject<BottomSheet | null>;
  onNavigateToCfi: (cfi: string) => void;
}

const FILTER_COLORS: (HighlightColor | 'all')[] = ['all', 'yellow', 'green', 'blue', 'pink', 'purple', 'orange'];

export function HighlightListPanel({ bookId, sheetRef, onNavigateToCfi }: HighlightListPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const highlights = useHighlightStore((s) => s.getBookHighlights(bookId));
  const removeHighlight = useHighlightStore((s) => s.removeHighlight);
  const updateHighlightNote = useHighlightStore((s) => s.updateHighlightNote);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const [filterColor, setFilterColor] = useState<HighlightColor | 'all'>('all');
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  const filteredHighlights = useMemo(() => {
    const sorted = [...highlights].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (filterColor === 'all') return sorted;
    return sorted.filter((h) => h.color === filterColor);
  }, [highlights, filterColor]);

  const handlePress = useCallback(
    (highlight: Highlight) => {
      if (highlight.cfiPath) {
        onNavigateToCfi(highlight.cfiPath);
        sheetRef.current?.close();
      }
    },
    [onNavigateToCfi, sheetRef],
  );

  const handleDelete = useCallback(
    (highlight: Highlight) => {
      Alert.alert(
        t('reader.deleteHighlight', { defaultValue: 'Delete Highlight' }),
        t('reader.deleteHighlightConfirm', { defaultValue: 'Are you sure?' }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete', { defaultValue: 'Delete' }),
            style: 'destructive',
            onPress: () => removeHighlight(bookId, highlight.id),
          },
        ],
      );
    },
    [bookId, removeHighlight, t],
  );

  const handleSaveNote = useCallback(
    (note: string) => {
      if (editingHighlight) {
        updateHighlightNote(bookId, editingHighlight.id, note);
        setEditingHighlight(null);
      }
    },
    [bookId, editingHighlight, updateHighlightNote],
  );

  const renderItem = useCallback(
    ({ item }: { item: Highlight }) => (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: colors.surface }]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.colorBar, { backgroundColor: HIGHLIGHT_COLORS[item.color].underline }]}
        />
        <View style={styles.itemContent}>
          <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={3}>
            {item.selectedText}
          </Text>
          {item.note && (
            <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.note}
            </Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => setEditingHighlight(item)} hitSlop={8}>
            <Ionicons name="create-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [colors, handlePress, handleDelete],
  );

  return (
    <>
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
              {t('reader.highlights', { defaultValue: 'Highlights' })}
            </Text>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {filteredHighlights.length}
            </Text>
          </View>

          {/* Color filter */}
          <View style={styles.filterRow}>
            {FILTER_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.filterChip,
                  color === 'all'
                    ? { backgroundColor: filterColor === 'all' ? colors.primary : colors.surface }
                    : {
                        backgroundColor:
                          filterColor === color
                            ? HIGHLIGHT_COLORS[color].underline
                            : HIGHLIGHT_COLORS[color].bg,
                      },
                ]}
                onPress={() => setFilterColor(color)}
              >
                {color === 'all' && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: filterColor === 'all' ? colors.onPrimary : colors.text,
                    }}
                  >
                    All
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {filteredHighlights.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="color-palette-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('reader.noHighlights', { defaultValue: 'No highlights yet' })}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredHighlights}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </BottomSheetView>
      </BottomSheet>

      {editingHighlight && (
        <NoteEditor
          initialNote={editingHighlight.note}
          onSave={handleSaveNote}
          onCancel={() => setEditingHighlight(null)}
        />
      )}
    </>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  count: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: 8,
    paddingBottom: 32,
  },
  item: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemNote: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemActions: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
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
