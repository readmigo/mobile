import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { UserBook } from '@/services/api/books';

interface BookshelfListViewProps {
  items: UserBook[];
  isEditMode: boolean;
  selectedIds: Set<string>;
  onItemPress: (item: UserBook) => void;
  onToggleSelect: (bookId: string) => void;
}

export function BookshelfListView({
  items,
  isEditMode,
  selectedIds,
  onItemPress,
  onToggleSelect,
}: BookshelfListViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
    <View>
      {items.map((item, index) => {
        const isSelected = selectedIds.has(item.bookId);
        const progressPct = Math.round((item.progress ?? 0) * 100);
        const showDivider = index < items.length - 1;

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => handlePress(item)}
            activeOpacity={0.6}
          >
            {isEditMode && (
              <View style={styles.checkboxWrap}>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isSelected ? colors.primary : colors.textTertiary}
                />
              </View>
            )}

            {item.book.coverUrl ? (
              <Image
                source={{ uri: item.book.coverUrl }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.cover,
                  styles.coverPlaceholder,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="book" size={20} color={colors.primary} />
              </View>
            )}

            <View style={styles.info}>
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

              <View style={styles.metaRow}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: item.isCompleted ? colors.primary : colors.primary,
                        width: `${item.isCompleted ? 100 : progressPct}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                  {item.isCompleted
                    ? t('library.finished')
                    : t('library.progress', { value: progressPct })}
                </Text>
              </View>
            </View>

            {!isEditMode && (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            )}

            {showDivider && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border, left: isEditMode ? 100 : 76 },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    position: 'relative',
  },
  checkboxWrap: {
    width: 24,
    alignItems: 'center',
  },
  cover: {
    width: 48,
    height: 72,
    borderRadius: 6,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  author: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    maxWidth: 100,
  },
  progressBarFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 11,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    height: StyleSheet.hairlineWidth,
  },
});
