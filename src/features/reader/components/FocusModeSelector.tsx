import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export type FocusMode = 'off' | 'spotlight' | 'paragraph' | 'ruler';

interface FocusModeSelectorProps {
  current: FocusMode;
  onSelect: (mode: FocusMode) => void;
}

const FOCUS_MODES: { id: FocusMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: 'off', icon: 'eye-outline', label: 'Off' },
  { id: 'spotlight', icon: 'flashlight-outline', label: 'Spotlight' },
  { id: 'paragraph', icon: 'reorder-four-outline', label: 'Paragraph' },
  { id: 'ruler', icon: 'remove-outline', label: 'Ruler' },
];

export function FocusModeSelector({ current, onSelect }: FocusModeSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('reader.focusMode', { defaultValue: 'Focus Mode' })}
      </Text>
      <View style={styles.options}>
        {FOCUS_MODES.map((mode) => {
          const isActive = current === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.option,
                { backgroundColor: isActive ? colors.primary + '20' : colors.background },
                isActive && { borderColor: colors.primary, borderWidth: 1.5 },
              ]}
              onPress={() => onSelect(mode.id)}
            >
              <Ionicons
                name={mode.icon}
                size={18}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// CSS injected into WebView for each focus mode
export function getFocusModeCSS(mode: FocusMode): string {
  switch (mode) {
    case 'spotlight':
      return `
        body::before {
          content: '';
          position: fixed; top: 0; left: 0; right: 0; height: 35%;
          background: rgba(0,0,0,0.6);
          pointer-events: none; z-index: 9998;
        }
        body::after {
          content: '';
          position: fixed; bottom: 0; left: 0; right: 0; height: 35%;
          background: rgba(0,0,0,0.6);
          pointer-events: none; z-index: 9998;
        }
      `;
    case 'paragraph':
      return `
        p, div.paragraph {
          opacity: 0.25;
          transition: opacity 0.3s;
        }
        p:hover, p:focus, p.focus-active,
        div.paragraph:hover, div.paragraph.focus-active {
          opacity: 1;
        }
      `;
    case 'ruler':
      return `
        #focus-ruler {
          position: fixed;
          left: 0; right: 0;
          height: 3px;
          background: rgba(66,133,244,0.7);
          pointer-events: none;
          z-index: 9998;
          top: 50%;
          box-shadow: 0 0 8px rgba(66,133,244,0.4);
        }
      `;
    default:
      return '';
  }
}

// JS to inject/remove focus mode styles
export function getFocusModeJS(mode: FocusMode): string {
  const css = getFocusModeCSS(mode).replace(/\n/g, ' ').replace(/'/g, "\\'");
  return `
    (function() {
      var existing = document.getElementById('focus-mode-style');
      if (existing) existing.remove();
      var ruler = document.getElementById('focus-ruler');
      if (ruler) ruler.remove();

      ${mode !== 'off' ? `
        var style = document.createElement('style');
        style.id = 'focus-mode-style';
        style.textContent = '${css}';
        document.head.appendChild(style);
      ` : ''}

      ${mode === 'ruler' ? `
        var div = document.createElement('div');
        div.id = 'focus-ruler';
        document.body.appendChild(div);
      ` : ''}
    })();
    true;
  `;
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  options: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionLabel: { fontSize: 11, fontWeight: '500' },
});
