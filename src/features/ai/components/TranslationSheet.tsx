import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { aiApi, TRANSLATION_LOCALES, ParagraphTranslation } from '@/services/api/ai';
import { useSettingsStore } from '@/stores/settingsStore';

interface TranslationSheetProps {
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  originalText: string;
  charOffset?: number;
  charLength?: number;
  onClose: () => void;
}

export function TranslationSheet({
  bookId,
  chapterId,
  paragraphIndex,
  originalText,
  charOffset,
  charLength,
  onClose,
}: TranslationSheetProps) {
  const { colors } = useTheme();
  const language = useSettingsStore((s) => s.language);

  // Default locale based on app language
  const defaultLocale = language === 'en' ? 'zh-Hans' : 'en';
  const [selectedLocale, setSelectedLocale] = useState(defaultLocale);
  const [translation, setTranslation] = useState<ParagraphTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslation = useCallback(async (locale: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedLocale(locale);

    try {
      const response = charOffset !== undefined && charLength !== undefined
        ? await aiApi.getSentenceTranslation(bookId, chapterId, locale, paragraphIndex, charOffset, charLength)
        : await aiApi.getParagraphTranslation(bookId, chapterId, locale, paragraphIndex);
      setTranslation(response.data);
    } catch (err) {
      setError('Translation unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [bookId, chapterId, paragraphIndex, charOffset, charLength]);

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchTranslation(selectedLocale);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Translation</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.localeScroll}>
        {TRANSLATION_LOCALES.map((loc) => (
          <TouchableOpacity
            key={loc.code}
            onPress={() => fetchTranslation(loc.code)}
            style={[
              styles.localeChip,
              {
                backgroundColor: selectedLocale === loc.code ? colors.primary : colors.background,
                borderColor: selectedLocale === loc.code ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={styles.localeFlag}>{loc.flag}</Text>
            <Text
              style={[
                styles.localeName,
                { color: selectedLocale === loc.code ? '#FFF' : colors.text },
              ]}
            >
              {loc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Original Text */}
      <View style={[styles.textBlock, { backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Original</Text>
        <Text style={[styles.textContent, { color: colors.text }]} numberOfLines={6}>
          {originalText}
        </Text>
      </View>

      {/* Translation */}
      <View style={[styles.textBlock, { backgroundColor: colors.primary + '0D' }]}>
        <Text style={[styles.label, { color: colors.primary }]}>Translation</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : error ? (
          <Text style={[styles.errorText, { color: '#E53935' }]}>{error}</Text>
        ) : translation ? (
          <Text style={[styles.textContent, { color: colors.text }]}>{translation.translation}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  localeScroll: { marginBottom: 16 },
  localeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, marginRight: 8,
  },
  localeFlag: { fontSize: 16 },
  localeName: { fontSize: 13, fontWeight: '500' },
  textBlock: { borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  textContent: { fontSize: 15, lineHeight: 22 },
  errorText: { fontSize: 14, textAlign: 'center', marginVertical: 8 },
});
