import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { faqApi, FAQItem } from '@/services/api/faq';

export function HelpScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: async () => {
      const res = await faqApi.getCategories();
      return res.data;
    },
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['faq', 'items', searchQuery],
    queryFn: async () => {
      if (searchQuery.length > 1) {
        const res = await faqApi.search(searchQuery);
        return res.data;
      }
      const res = await faqApi.getItems();
      return res.data;
    },
  });

  const sections = categories?.map((cat) => ({
    title: cat.name,
    data: items?.filter((item) => item.categoryId === cat.id) ?? [],
  })).filter((s) => s.data.length > 0) ?? [];

  // When searching, show flat list
  const searchSections = searchQuery.length > 1
    ? [{ title: t('help.searchResults', { defaultValue: 'Search Results' }), data: items ?? [] }]
    : sections;

  const handleFeedback = () => {
    Alert.prompt?.(
      t('help.feedback', { defaultValue: 'Send Feedback' }),
      t('help.feedbackHint', { defaultValue: 'Tell us how we can help' }),
      async (text) => {
        if (text?.trim()) {
          try {
            await faqApi.submitFeedback({ subject: 'App Feedback', message: text.trim() });
            Alert.alert(t('help.thanks', { defaultValue: 'Thank You!' }), t('help.feedbackSent', { defaultValue: 'Your feedback has been sent.' }));
          } catch {}
        }
      },
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: FAQItem }) => {
      const isExpanded = expandedId === item.id;
      return (
        <TouchableOpacity
          style={[styles.faqItem, { backgroundColor: colors.surface }]}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.questionRow}>
            <Text style={[styles.question, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 2}>
              {item.question}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textTertiary}
            />
          </View>
          {isExpanded && (
            <Text style={[styles.answer, { color: colors.textSecondary }]}>
              {item.answer}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [expandedId, colors],
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('help.searchPlaceholder', { defaultValue: 'Search help articles...' })}
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FAQ List */}
      <SectionList
        sections={searchSections}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="help-circle-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('help.noResults', { defaultValue: 'No results found' })}
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={[styles.feedbackBtn, { borderColor: colors.border }]} onPress={handleFeedback}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
            <Text style={[styles.feedbackText, { color: colors.primary }]}>
              {t('help.cantFind', { defaultValue: "Can't find what you need? Send us feedback" })}
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  faqItem: { borderRadius: 12, padding: 14, marginBottom: 8 },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  question: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  answer: { fontSize: 14, lineHeight: 22, marginTop: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackText: { fontSize: 14, fontWeight: '500' },
});
