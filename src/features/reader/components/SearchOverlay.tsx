import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle?: string;
}

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onResultSelect: (cfi: string) => void;
  results: SearchResult[];
  isSearching: boolean;
}

export function SearchOverlay({
  visible,
  onClose,
  onSearch,
  onResultSelect,
  results,
  isSearching,
}: SearchOverlayProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      Keyboard.dismiss();
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search in book..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isSearching && (
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>Searching...</Text>
      )}

      {!isSearching && results.length > 0 && (
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: colors.border }]}
            onPress={() => onResultSelect(item.cfi)}
          >
            {item.chapterTitle && (
              <Text style={[styles.chapterTitle, { color: colors.primary }]}>{item.chapterTitle}</Text>
            )}
            <Text style={[styles.excerpt, { color: colors.text }]} numberOfLines={3}>
              {item.excerpt}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.resultList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, height: 44, borderRadius: 10, borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16 },
  closeButton: { padding: 8 },
  closeText: { fontSize: 16, fontWeight: '500' },
  statusText: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 8 },
  resultList: { paddingBottom: 40 },
  resultItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  chapterTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  excerpt: { fontSize: 14, lineHeight: 20 },
});
