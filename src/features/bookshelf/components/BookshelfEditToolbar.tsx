import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

interface BookshelfEditToolbarProps {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onDelete: () => void;
}

export function BookshelfEditToolbar({
  totalCount,
  selectedCount,
  allSelected,
  onToggleSelectAll,
  onDelete,
}: BookshelfEditToolbarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const confirmDelete = () => {
    if (selectedCount === 0) return;
    Alert.alert(
      t('bookshelf.delete.confirmTitle'),
      t('bookshelf.delete.confirmMessage', { count: selectedCount }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={onToggleSelectAll}>
        <Text style={[styles.action, { color: colors.primary }]}>
          {allSelected ? t('bookshelf.deselectAll') : t('bookshelf.selectAll')}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.countText, { color: colors.textSecondary }]}>
        {t('bookshelf.selectedCount', { count: selectedCount, total: totalCount })}
      </Text>

      <TouchableOpacity
        onPress={confirmDelete}
        disabled={selectedCount === 0}
        style={styles.deleteButton}
      >
        <Ionicons
          name="trash-outline"
          size={22}
          color={selectedCount === 0 ? colors.textTertiary : colors.error}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  action: {
    fontSize: 14,
    fontWeight: '500',
  },
  countText: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
  },
  deleteButton: {
    paddingHorizontal: 4,
  },
});
