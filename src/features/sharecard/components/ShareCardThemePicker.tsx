import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ShareCardThemeId } from '../types';
import { SHARE_CARD_THEMES, SHARE_CARD_THEME_ORDER } from '../theme';

interface ShareCardThemePickerProps {
  selected: ShareCardThemeId;
  onSelect: (id: ShareCardThemeId) => void;
}

export function ShareCardThemePicker({ selected, onSelect }: ShareCardThemePickerProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SHARE_CARD_THEME_ORDER.map((id) => {
        const theme = SHARE_CARD_THEMES[id];
        const isSelected = selected === id;
        const checkColor = id === 'dark' ? '#FFFFFF' : '#4A4A4A';
        const labelKey = `share.style.${id}`;

        return (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(id)}
            activeOpacity={0.7}
            style={styles.swatchWrap}
          >
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.previewBorder,
                },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={checkColor} />
              )}
              {theme.isPremium && (
                <View style={styles.crownBadge}>
                  <Ionicons name="star" size={9} color="#FB8C00" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelDefault,
              ]}
            >
              {t(labelKey, { defaultValue: id.charAt(0).toUpperCase() + id.slice(1) })}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 12,
  },
  swatchWrap: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  labelDefault: {
    color: '#737373',
  },
  labelSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
