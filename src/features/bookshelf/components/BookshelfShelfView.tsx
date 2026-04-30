import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { UserBook } from '@/services/api/books';

interface BookshelfShelfViewProps {
  items: UserBook[];
  isEditMode: boolean;
  selectedIds: Set<string>;
  onItemPress: (item: UserBook) => void;
  onToggleSelect: (bookId: string) => void;
}

const NUM_COLUMNS = 3;
const HORIZONTAL_PADDING = 16;
const ITEM_GAP = 14;

export function BookshelfShelfView({
  items,
  isEditMode,
  selectedIds,
  onItemPress,
  onToggleSelect,
}: BookshelfShelfViewProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const itemWidth =
    (width - HORIZONTAL_PADDING * 2 - ITEM_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
  const coverHeight = itemWidth * 1.5;

  const handlePress = useCallback(
    (item: UserBook) => {
      if (isEditMode) {
        onToggleSelect(item.bookId);
      } else {
        onItemPress(item);
      }
    },
    [isEditMode, onItemPress, onToggleSelect]
  );

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const isSelected = selectedIds.has(item.bookId);
        const progressPct = Math.round((item.progress ?? 0) * 100);

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, { width: itemWidth }]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.coverWrap}>
              {item.book.coverUrl ? (
                <Image
                  source={{ uri: item.book.coverUrl }}
                  style={[
                    styles.cover,
                    { width: itemWidth, height: coverHeight },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.cover,
                    styles.coverPlaceholder,
                    {
                      width: itemWidth,
                      height: coverHeight,
                      backgroundColor: colors.primary + '20',
                    },
                  ]}
                >
                  <Ionicons name="book" size={32} color={colors.primary} />
                </View>
              )}

              {progressPct > 0 && progressPct < 100 && (
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${progressPct}%`,
                      },
                    ]}
                  />
                </View>
              )}

              {item.isCompleted && (
                <View style={[styles.completedBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
                </View>
              )}

              {isEditMode && (
                <View
                  style={[
                    styles.checkOverlay,
                    {
                      backgroundColor: isSelected ? colors.primary + 'CC' : 'rgba(0,0,0,0.25)',
                    },
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color="#fff"
                  />
                </View>
              )}
            </View>

            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.book.title}
            </Text>
            <Text
              style={[styles.author, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.book.author}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: ITEM_GAP,
  },
  item: {
    marginBottom: 8,
  },
  coverWrap: {
    position: 'relative',
    marginBottom: 6,
  },
  cover: {
    borderRadius: 8,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  completedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  author: {
    fontSize: 11,
    marginTop: 1,
  },
});
