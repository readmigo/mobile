import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useAudiobooks, useRecentlyPlayedAudiobooks } from '@/features/audiobook/hooks';
import { useAudioPlayerStore, formatDuration } from '@/features/audiobook/stores/audioPlayerStore';
import { audiobookApi } from '@/features/audiobook/services/audiobookApi';
import type { AudiobookListItem } from '@/features/audiobook/types';

const LANGUAGES = [
  { key: 'all', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'fr', label: 'French' },
  { key: 'de', label: 'German' },
  { key: 'es', label: 'Spanish' },
];

function AudiobookCard({
  item,
  onPress,
  colors,
  t,
}: {
  item: AudiobookListItem;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <TouchableOpacity
      style={[styles.audiobookCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {item.coverUrl ? (
          <Image
            source={{ uri: item.coverUrl }}
            style={[styles.audiobookCover, { backgroundColor: colors.surfaceSecondary }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.audiobookCoverPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="headset" size={28} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.headsetBadgeSmall}>
          <Ionicons name="headset" size={8} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.audiobookInfo}>
        <Text style={[styles.audiobookTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.audiobookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.author}
        </Text>
        {item.narrator && (
          <Text style={[styles.audiobookNarrator, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('audiobook.narratedBy', { name: item.narrator })}
          </Text>
        )}
        <View style={styles.audiobookMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={10} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {formatDuration(item.totalDuration)}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {t('audiobook.chaptersCount', { count: item.chapterCount })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecentlyListenedSection({
  onPlay,
}: {
  onPlay: (id: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: recentlyPlayed, isLoading } = useRecentlyPlayedAudiobooks(10);

  if (isLoading || !recentlyPlayed || recentlyPlayed.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('audiobook.recentlyListened')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentList}
      >
        {recentlyPlayed.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.recentCard, {
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }]}
            activeOpacity={0.7}
            onPress={() => onPlay(item.id)}
          >
            {item.coverUrl ? (
              <Image
                source={{ uri: item.coverUrl }}
                style={[styles.recentCover, { backgroundColor: colors.surfaceSecondary }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.recentCoverPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="headset" size={24} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.headsetBadge}>
              <Ionicons name="headset" size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.recentAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.author}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function AudiobookScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchText, setSearchText] = useState('');
  const loadAudiobook = useAudioPlayerStore((state) => state.loadAudiobook);

  const { data: audiobooksData, isLoading, refetch, isRefetching } = useAudiobooks({
    language: selectedLanguage === 'all' ? undefined : selectedLanguage,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const audiobooks = audiobooksData?.data ?? [];

  const filteredAudiobooks = useMemo(() => {
    if (!searchText.trim()) return audiobooks;
    const query = searchText.toLowerCase();
    return audiobooks.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        (item.narrator && item.narrator.toLowerCase().includes(query)),
    );
  }, [audiobooks, searchText]);

  const handlePlayAudiobook = useCallback(
    async (id: string) => {
      try {
        const response = await audiobookApi.getAudiobook(id);
        const audiobook = response.data.data;
        await loadAudiobook(audiobook);
        router.push('/audiobook-player');
      } catch (error) {
        console.error('Failed to load audiobook:', error);
      }
    },
    [loadAudiobook],
  );

  const renderItem = useCallback(
    ({ item }: { item: AudiobookListItem }) => (
      <AudiobookCard item={item} onPress={() => handlePlayAudiobook(item.id)} colors={colors} t={t} />
    ),
    [handlePlayAudiobook, colors, t],
  );

  const ListHeader = (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('audiobook.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recently Listened */}
      <RecentlyListenedSection onPlay={handlePlayAudiobook} />

      {/* Language Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.key;
          return (
            <TouchableOpacity
              key={lang.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.textTertiary + '26',
                },
              ]}
              onPress={() => setSelectedLanguage(lang.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {lang.key === 'all' ? t('audiobook.allLanguages') : lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('audiobook.title')}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredAudiobooks.length === 0 && !searchText ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {ListHeader}
          <View style={styles.emptyContainer}>
            <Ionicons name="headset" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('audiobook.emptyTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('audiobook.emptySubtitle')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlashList<AudiobookListItem>
          data={filteredAudiobooks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={100}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  // Recently Listened
  recentSection: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recentCard: {
    width: 120,
  },
  recentCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentCoverPlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headsetBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headsetBadgeSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  recentAuthor: {
    fontSize: 11,
    marginTop: 2,
  },
  // Language Filter
  filterContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
  },
  // Audiobook List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  audiobookCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  coverContainer: {
    position: 'relative',
  },
  audiobookCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  audiobookCoverPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audiobookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audiobookTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  audiobookAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  audiobookNarrator: {
    fontSize: 11,
    marginTop: 2,
  },
  audiobookMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
  },
});
