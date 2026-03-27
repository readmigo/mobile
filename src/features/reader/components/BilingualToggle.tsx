import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { TRANSLATION_LOCALES } from '@/services/api/ai';

export type BilingualMode = 'off' | 'bilingual' | 'translation-only';

interface BilingualToggleProps {
  mode: BilingualMode;
  locale: string;
  onModeChange: (mode: BilingualMode) => void;
  onLocaleChange: (locale: string) => void;
}

const MODES: { id: BilingualMode; label: string }[] = [
  { id: 'off', label: 'Original' },
  { id: 'bilingual', label: 'Bilingual' },
  { id: 'translation-only', label: 'Translated' },
];

export function BilingualToggle({ mode, locale, onModeChange, onLocaleChange }: BilingualToggleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Translation</Text>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.modeBtn,
                { backgroundColor: isActive ? colors.primary : colors.background },
              ]}
              onPress={() => onModeChange(m.id)}
            >
              <Text style={[styles.modeBtnText, { color: isActive ? colors.onPrimary : colors.textSecondary }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Language picker (only when not off) */}
      {mode !== 'off' && (
        <View style={styles.localeRow}>
          {TRANSLATION_LOCALES.slice(0, 6).map((loc) => {
            const isActive = locale === loc.code;
            return (
              <TouchableOpacity
                key={loc.code}
                style={[
                  styles.localeChip,
                  { backgroundColor: isActive ? colors.primary + '20' : colors.surface },
                  isActive && { borderColor: colors.primary, borderWidth: 1 },
                ]}
                onPress={() => onLocaleChange(loc.code)}
              >
                <Text style={{ fontSize: 14 }}>{loc.flag}</Text>
                <Text style={[styles.localeText, { color: isActive ? colors.primary : colors.text }]}>
                  {loc.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  modeRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  modeBtnText: { fontSize: 12, fontWeight: '600' },
  localeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  localeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  localeText: { fontSize: 12, fontWeight: '500' },
});
