import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { aiApi, ExplainResponse } from '@/services/api/ai';

interface AIExplanationPanelProps {
  text: string;
  context?: string;
  bookId?: string;
  chapterId?: string;
  onClose: () => void;
  onSaveToVocabulary?: () => void;
}

export function AIExplanationPanel({
  text,
  context,
  bookId,
  chapterId,
  onClose,
  onSaveToVocabulary,
}: AIExplanationPanelProps) {
  const { colors } = useTheme();
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSimplified, setShowSimplified] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);

  useEffect(() => {
    fetchExplanation();
  }, [text]);

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiApi.explain({ text, context, bookId, chapterId });
      setResult(response.data);
    } catch (err) {
      setError('Could not get explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimplification = async () => {
    if (simplifiedText) {
      setShowSimplified(!showSimplified);
      return;
    }
    try {
      const response = await aiApi.simplify({ text: context || text });
      setSimplifiedText(response.data.simplifiedText);
      setShowSimplified(true);
    } catch {
      // Silently fail simplification
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>AI Explanation</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Selected Text */}
      <View style={[styles.selectedTextBox, { backgroundColor: colors.primary + '0D' }]}>
        <Text style={[styles.selectedText, { color: colors.primary }]}>"{text}"</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: '#E53935' }]}>{error}</Text>
            <TouchableOpacity onPress={fetchExplanation} style={[styles.retryButton, { borderColor: colors.primary }]}>
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <>
            {/* Pronunciation */}
            {result.pronunciation && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="volume-medium-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Pronunciation</Text>
                </View>
                <Text style={[styles.pronunciation, { color: colors.text }]}>{result.pronunciation}</Text>
              </View>
            )}

            {/* Explanation */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Explanation</Text>
              </View>
              <Text style={[styles.explanationText, { color: colors.text }]}>{result.explanation}</Text>
            </View>

            {/* Examples */}
            {result.examples && result.examples.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Examples</Text>
                </View>
                {result.examples.map((ex, i) => (
                  <View key={i} style={[styles.exampleItem, { borderLeftColor: colors.primary }]}>
                    <Text style={[styles.exampleText, { color: colors.text }]}>{ex}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Related Words */}
            {result.relatedWords && result.relatedWords.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="link-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Related Words</Text>
                </View>
                <View style={styles.relatedRow}>
                  {result.relatedWords.map((word, i) => (
                    <View key={i} style={[styles.relatedChip, { backgroundColor: colors.background }]}>
                      <Text style={[styles.relatedText, { color: colors.text }]}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Simplified */}
            {showSimplified && simplifiedText && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="text-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Simplified</Text>
                </View>
                <Text style={[styles.explanationText, { color: colors.text }]}>{simplifiedText}</Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Actions */}
      {result && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={fetchSimplification}
            style={[styles.actionButton, { backgroundColor: colors.background }]}
          >
            <Ionicons name="text-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {showSimplified ? 'Hide Simplified' : 'Simplify'}
            </Text>
          </TouchableOpacity>
          {onSaveToVocabulary && (
            <TouchableOpacity
              onPress={onSaveToVocabulary}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="bookmark-outline" size={18} color="#FFF" />
              <Text style={[styles.actionText, { color: '#FFF' }]}>Save to Vocabulary</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  selectedTextBox: { borderRadius: 8, padding: 12, marginBottom: 12 },
  selectedText: { fontSize: 16, fontWeight: '600', fontStyle: 'italic' },
  scrollContent: { maxHeight: 400 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  pronunciation: { fontSize: 16, fontStyle: 'italic' },
  explanationText: { fontSize: 15, lineHeight: 22 },
  exampleItem: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 8 },
  exampleText: { fontSize: 14, lineHeight: 20 },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  relatedText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  actionText: { fontSize: 14, fontWeight: '600' },
  errorContainer: { alignItems: 'center', marginVertical: 24, gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  retryButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { fontSize: 14, fontWeight: '600' },
});
