import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  BookshelfDisplayMode,
  BookshelfSortOption,
} from '../stores/bookshelfStore';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface BookshelfTopBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  displayMode: BookshelfDisplayMode;
  onToggleDisplayMode: () => void;
  sortOption: BookshelfSortOption;
  onSortChange: (option: BookshelfSortOption) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  itemCount: number;
}

const SORT_OPTIONS: BookshelfSortOption[] = [
  'manual',
  'recent',
  'title',
  'author',
  'addedDate',
];

const SORT_ICONS: Record<BookshelfSortOption, IoniconName> = {
  manual: 'hand-left-outline',
  recent: 'time-outline',
  title: 'text-outline',
  author: 'person-outline',
  addedDate: 'calendar-outline',
};

export function BookshelfTopBar({
  searchText,
  onSearchTextChange,
  isSearchActive,
  onSearchActiveChange,
  displayMode,
  onToggleDisplayMode,
  sortOption,
  onSortChange,
  isEditMode,
  onToggleEditMode,
  itemCount,
}: BookshelfTopBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  if (isSearchActive) {
    return (
      <View style={styles.container}>
        <View style={styles.searchExpanded}>
          <View
            style={[
              styles.searchInputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + '4D',
              },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('bookshelf.search')}
              placeholderTextColor={colors.textTertiary}
              value={searchText}
              onChangeText={onSearchTextChange}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => onSearchTextChange('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              onSearchTextChange('');
              onSearchActiveChange(false);
            }}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelText, { color: colors.primary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('bookshelf.title')}
          </Text>
          {itemCount > 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('bookshelf.itemCount', { count: itemCount })}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onSearchActiveChange(true)}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={[styles.menuSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <MenuRow
              icon={displayMode === 'shelf' ? 'list' : 'grid'}
              label={
                displayMode === 'shelf'
                  ? t('bookshelf.viewAsList')
                  : t('bookshelf.viewAsShelf')
              }
              onPress={() => {
                onToggleDisplayMode();
                setMenuVisible(false);
              }}
            />

            <MenuSeparator />

            <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>
              {t('bookshelf.sortBy')}
            </Text>
            {SORT_OPTIONS.map((option) => (
              <MenuRow
                key={option}
                icon={sortOption === option ? 'checkmark' : SORT_ICONS[option]}
                label={t(`bookshelf.sort.${option}`)}
                checked={sortOption === option}
                onPress={() => {
                  onSortChange(option);
                  setMenuVisible(false);
                }}
              />
            ))}

            <MenuSeparator />

            <MenuRow
              icon={isEditMode ? 'checkmark-circle' : 'checkmark-circle-outline'}
              label={isEditMode ? t('common.done') : t('bookshelf.selectBooks')}
              onPress={() => {
                onToggleEditMode();
                setMenuVisible(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface MenuRowProps {
  icon: IoniconName;
  label: string;
  checked?: boolean;
  onPress: () => void;
}

function MenuRow({ icon, label, checked, onPress }: MenuRowProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.6}>
      <Ionicons
        name={icon}
        size={20}
        color={checked ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.menuRowLabel,
          { color: checked ? colors.primary : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MenuSeparator() {
  const { colors } = useTheme();
  return <View style={[styles.menuSeparator, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  cancelButton: {
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    paddingTop: 8,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuRowLabel: {
    fontSize: 15,
  },
  menuSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
    marginHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
});
