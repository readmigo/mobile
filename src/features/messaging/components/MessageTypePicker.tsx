import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { FeedbackCategory, FEEDBACK_CATEGORIES } from '../types';

interface MessageTypePickerProps {
  selected: FeedbackCategory;
  onSelect: (category: FeedbackCategory) => void;
}

export function MessageTypePicker({ selected, onSelect }: MessageTypePickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {FEEDBACK_CATEGORIES.map((cat, idx) => {
        const isSelected = selected === cat.id;
        const showDivider = idx < FEEDBACK_CATEGORIES.length - 1;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.row,
              showDivider && {
                borderBottomColor: colors.border,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.6}
          >
            <View style={[styles.iconWrap, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon} size={18} color={cat.color} />
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              {t(cat.labelKey)}
            </Text>

            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={isSelected ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
