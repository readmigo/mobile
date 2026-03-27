import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  useHighlightStore,
  HighlightColor,
  HIGHLIGHT_COLORS,
} from '../stores/highlightStore';

interface HighlightToolbarProps {
  selectedText: string;
  selectedCfi: string;
  bookId: string;
  chapterId: string;
  onHighlightCreated: () => void;
  onExplain: () => void;
  onTranslate: () => void;
  onDismiss: () => void;
}

const COLOR_ORDER: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange'];

export function HighlightToolbar({
  selectedText,
  selectedCfi,
  bookId,
  chapterId,
  onHighlightCreated,
  onExplain,
  onTranslate,
  onDismiss,
}: HighlightToolbarProps) {
  const { colors } = useTheme();
  const addHighlight = useHighlightStore((s) => s.addHighlight);
  const activeColor = useHighlightStore((s) => s.activeColor);
  const activeStyle = useHighlightStore((s) => s.activeStyle);
  const setActiveColor = useHighlightStore((s) => s.setActiveColor);

  const handleColorSelect = useCallback(
    (color: HighlightColor) => {
      setActiveColor(color);
      addHighlight({
        id: Date.now().toString(),
        bookId,
        chapterId,
        selectedText,
        color,
        style: activeStyle,
        paragraphIndex: 0,
        charOffset: 0,
        charLength: selectedText.length,
        cfiPath: selectedCfi,
        createdAt: new Date().toISOString(),
      });
      onHighlightCreated();
    },
    [bookId, chapterId, selectedText, selectedCfi, activeStyle, addHighlight, setActiveColor, onHighlightCreated],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Color dots */}
      <View style={styles.colorsRow}>
        {COLOR_ORDER.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorDot,
              { backgroundColor: HIGHLIGHT_COLORS[color].underline },
              activeColor === color && styles.colorDotActive,
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onExplain}>
          <Ionicons name="bulb-outline" size={20} color={colors.text} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Explain</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onTranslate}>
          <Ionicons name="language-outline" size={20} color={colors.text} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Translate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDismiss}>
          <Ionicons name="close-outline" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 10,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
