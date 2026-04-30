import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { quotesApi, Quote } from '@/services/api/quotes';
import {
  ShareCardSheet,
  ShareCardContent,
} from '@/features/sharecard';

function QuoteCard({
  quote,
  onToggleFavorite,
  onShare,
}: {
  quote: Quote;
  onToggleFavorite: (id: string) => void;
  onShare: (quote: Quote) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.quoteBar, { backgroundColor: colors.primary }]} />
      <View style={styles.cardContent}>
        <Text style={[styles.quoteText, { color: colors.text }]}>"{quote.text}"</Text>
        <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
          — {quote.author}
          {quote.source ? `, ${quote.source}` : ''}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onToggleFavorite(quote.id)} hitSlop={8}>
            <Ionicons
              name={quote.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={quote.isFavorite ? '#E53935' : colors.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onShare(quote)} hitSlop={8}>
            <Ionicons name="share-outline" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function QuotesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'daily' | 'browse' | 'favorites'>('daily');
  const shareSheetRef = useRef<BottomSheet>(null);
  const [shareContent, setShareContent] = useState<ShareCardContent | null>(null);

  const handleOpenShareCard = useCallback((quote: Quote) => {
    setShareContent({
      text: quote.text,
      author: quote.author,
      bookTitle: quote.source,
      source: 'quote',
    });
    shareSheetRef.current?.snapToIndex(0);
  }, []);

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['quotes', 'daily'],
    queryFn: async () => (await quotesApi.getDaily()).data,
  });

  const { data: browse, isLoading: loadingBrowse, refetch: refetchBrowse } = useQuery({
    queryKey: ['quotes', 'browse'],
    queryFn: async () => (await quotesApi.getByCategory(undefined, { pageSize: 30 })).data,
    enabled: tab === 'browse',
  });

  const { data: favorites, isLoading: loadingFavorites, refetch: refetchFavorites } = useQuery({
    queryKey: ['quotes', 'favorites'],
    queryFn: async () => (await quotesApi.getFavorites()).data,
    enabled: tab === 'favorites',
  });

  const { mutate: toggleFav } = useMutation({
    mutationFn: (id: string) => quotesApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'daily', label: t('quotes.daily', { defaultValue: 'Today' }) },
    { id: 'browse', label: t('quotes.browse', { defaultValue: 'Browse' }) },
    { id: 'favorites', label: t('quotes.favorites', { defaultValue: 'Favorites' }) },
  ];

  const renderItem = useCallback(
    ({ item }: { item: Quote }) => (
      <QuoteCard
        quote={item}
        onToggleFavorite={toggleFav}
        onShare={handleOpenShareCard}
      />
    ),
    [toggleFav, handleOpenShareCard],
  );

  const isLoading = tab === 'daily' ? loadingDaily : tab === 'browse' ? loadingBrowse : loadingFavorites;
  const listData = tab === 'browse' ? browse : favorites;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface }]}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, { color: tab === t.id ? colors.primary : colors.textSecondary }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : tab === 'daily' && daily ? (
        <View style={styles.dailyContainer}>
          <QuoteCard
            quote={daily}
            onToggleFavorite={toggleFav}
            onShare={handleOpenShareCard}
          />
        </View>
      ) : (
        <FlatList
          data={listData ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => (tab === 'browse' ? refetchBrowse() : refetchFavorites())}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbox-ellipses-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {tab === 'favorites'
                  ? t('quotes.noFavorites', { defaultValue: 'No favorite quotes yet' })
                  : t('quotes.noQuotes', { defaultValue: 'No quotes available' })}
              </Text>
            </View>
          }
        />
      )}

      <ShareCardSheet sheetRef={shareSheetRef} content={shareContent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dailyContainer: { padding: 16, paddingTop: 24 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden' },
  quoteBar: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  quoteText: { fontSize: 16, lineHeight: 26, fontStyle: 'italic', marginBottom: 10 },
  quoteAuthor: { fontSize: 13, marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
