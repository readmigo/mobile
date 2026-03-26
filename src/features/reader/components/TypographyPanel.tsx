import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, AVAILABLE_FONTS, READER_THEME_COLORS, ReaderTheme, TextAlignment } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28];
const LINE_SPACINGS = [1.2, 1.4, 1.6, 1.8, 2.0];
const FONT_WEIGHTS = [300, 400, 500, 600, 700] as const;
const ALIGNMENTS: { value: TextAlignment; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'left', icon: 'reorder-three-outline' },
  { value: 'center', icon: 'reorder-three-outline' },
  { value: 'right', icon: 'reorder-three-outline' },
  { value: 'justified', icon: 'reorder-four-outline' },
];

export function TypographyPanel() {
  const { colors } = useTheme();
  const {
    fontSize, fontFamily, lineSpacing, textAlignment,
    letterSpacing, wordSpacing, paragraphSpacing, fontWeight,
    readerTheme, setReaderSettings,
  } = useSettingsStore();

  const themeOptions: { key: ReaderTheme; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'sepia', label: 'Sepia' },
    { key: 'dark', label: 'Dark' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Reading Theme */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
      <View style={styles.themeRow}>
        {themeOptions.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.themeButton,
              {
                backgroundColor: READER_THEME_COLORS[t.key].background,
                borderColor: readerTheme === t.key ? colors.primary : colors.border,
                borderWidth: readerTheme === t.key ? 2 : 1,
              },
            ]}
            onPress={() => setReaderSettings({ readerTheme: t.key })}
          >
            <Text style={[styles.themeLabel, { color: READER_THEME_COLORS[t.key].text }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Font Size */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Font Size: {fontSize}px</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          onPress={() => setReaderSettings({ fontSize: Math.max(12, fontSize - 1) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          {FONT_SIZES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setReaderSettings({ fontSize: s })}
              style={[
                styles.sliderDot,
                { backgroundColor: fontSize >= s ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => setReaderSettings({ fontSize: Math.min(36, fontSize + 1) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Font Family */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Font</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontScroll}>
        {AVAILABLE_FONTS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setReaderSettings({ fontFamily: f.id })}
            style={[
              styles.fontChip,
              {
                backgroundColor: fontFamily === f.id ? colors.primary + '1A' : colors.surface,
                borderColor: fontFamily === f.id ? colors.primary : colors.border,
                borderWidth: fontFamily === f.id ? 2 : 1,
              },
            ]}
          >
            <Text style={[styles.fontChipText, { color: fontFamily === f.id ? colors.primary : colors.text }]}>
              {f.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Line Spacing */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Line Spacing: {lineSpacing}</Text>
      <View style={styles.chipRow}>
        {LINE_SPACINGS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setReaderSettings({ lineSpacing: s })}
            style={[
              styles.chip,
              {
                backgroundColor: lineSpacing === s ? colors.primary : colors.surface,
                borderColor: lineSpacing === s ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: lineSpacing === s ? '#FFF' : colors.text, fontWeight: '600', fontSize: 14 }}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Text Alignment */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Alignment</Text>
      <View style={styles.chipRow}>
        {ALIGNMENTS.map((a) => (
          <TouchableOpacity
            key={a.value}
            onPress={() => setReaderSettings({ textAlignment: a.value })}
            style={[
              styles.alignButton,
              {
                backgroundColor: textAlignment === a.value ? colors.primary : colors.surface,
                borderColor: textAlignment === a.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: textAlignment === a.value ? '#FFF' : colors.text, fontSize: 12, fontWeight: '600' }}>
              {a.value.charAt(0).toUpperCase() + a.value.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Letter Spacing */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Letter Spacing: {letterSpacing}</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          onPress={() => setReaderSettings({ letterSpacing: Math.max(0, letterSpacing - 0.5) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.valueText, { color: colors.text }]}>{letterSpacing.toFixed(1)}</Text>
        <TouchableOpacity
          onPress={() => setReaderSettings({ letterSpacing: Math.min(5, letterSpacing + 0.5) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Paragraph Spacing */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Paragraph Spacing: {paragraphSpacing}</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          onPress={() => setReaderSettings({ paragraphSpacing: Math.max(0, paragraphSpacing - 2) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.valueText, { color: colors.text }]}>{paragraphSpacing}px</Text>
        <TouchableOpacity
          onPress={() => setReaderSettings({ paragraphSpacing: Math.min(36, paragraphSpacing + 2) })}
          style={[styles.stepButton, { borderColor: colors.border }]}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Font Weight */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Font Weight</Text>
      <View style={styles.chipRow}>
        {FONT_WEIGHTS.map((w) => {
          const labels: Record<number, string> = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semi', 700: 'Bold' };
          return (
            <TouchableOpacity
              key={w}
              onPress={() => setReaderSettings({ fontWeight: w })}
              style={[
                styles.chip,
                {
                  backgroundColor: fontWeight === w ? colors.primary : colors.surface,
                  borderColor: fontWeight === w ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: fontWeight === w ? '#FFF' : colors.text, fontWeight: String(w) as any, fontSize: 13 }}>
                {labels[w]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeButton: { flex: 1, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  sliderTrack: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderDot: { width: 8, height: 8, borderRadius: 4 },
  fontScroll: { marginBottom: 4 },
  fontChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  fontChipText: { fontSize: 13, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  alignButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  valueText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
