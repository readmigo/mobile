import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, SavedWord } from '@/services/api/ai';

export function VocabularyListScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: words, isLoading } = useQuery({
    queryKey: ['vocabulary', 'list'],
    queryFn: () => aiApi.getSavedWords(),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (wordId: string) => aiApi.deleteWord(wordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const filteredWords = (words ?? []).filter((w) =>
    searchQuery ? w.word.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  const getMasteryColor = (level: number): string => {
    if (level >= 4) return '#4CAF50';
    if (level >= 3) return '#8BC34A';
    if (level >= 2) return '#FFC107';
    if (level >= 1) return '#FF9800';
    return '#F44336';
  };

  const handleDelete = (word: SavedWord) => {
    Alert.alert('Delete Word', `Remove "${word.word}" from vocabulary?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(word.id) },
    ]);
  };

  const renderItem = ({ item }: { item: SavedWord }) => (
    <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.wordHeader}>
        <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
        <View style={styles.wordActions}>
          <View style={[styles.masteryBadge, { backgroundColor: getMasteryColor(item.masteryLevel) + '1A' }]}>
            <Text style={[styles.masteryText, { color: getMasteryColor(item.masteryLevel) }]}>
              Lv.{item.masteryLevel}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.definition, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.definition}
      </Text>
      {item.bookTitle && (
        <Text style={[styles.source, { color: colors.textTertiary }]}>
          from "{item.bookTitle}"
        </Text>
      )}
      {item.nextReviewAt && (
        <Text style={[styles.reviewDate, { color: colors.primary }]}>
          Review: {new Date(item.nextReviewAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search vocabulary..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Word List */}
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12,
    height: 44, borderRadius: 10, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16 },
  statsRow: { paddingHorizontal: 16, paddingVertical: 8 },
  statsText: { fontSize: 13 },
  listContent: { padding: 16, paddingTop: 0, gap: 8 },
  wordCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  wordText: { fontSize: 17, fontWeight: '700' },
  wordActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  masteryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  masteryText: { fontSize: 12, fontWeight: '600' },
  definition: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  source: { fontSize: 12, fontStyle: 'italic' },
  reviewDate: { fontSize: 12, marginTop: 4 },
});
