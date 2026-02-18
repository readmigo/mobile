import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
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
}: {
  item: AudiobookListItem;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.audiobookCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.audiobookCover} resizeMode="cover" />
      ) : (
        <View style={[styles.audiobookCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="headset" size={28} color={colors.primary} />
        </View>
      )}
      <View style={styles.audiobookInfo}>
        <Text style={[styles.audiobookTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.audiobookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.author}
        </Text>
        {item.narrator && (
          <Text style={[styles.audiobookNarrator, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.narrator}
          </Text>
        )}
        <View style={styles.audiobookMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {formatDuration(item.totalDuration)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="list-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {item.chapterCount} ch
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecentlyListenedSection() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: recentlyPlayed, isLoading } = useRecentlyPlayedAudiobooks(10);

  if (isLoading || !recentlyPlayed || recentlyPlayed.length === 0) {
    return null;
  }

  return (
    <View style={styles.recentSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t('audiobook.recentlyListened', { defaultValue: 'Recently Listened' })}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentList}
      >
        {recentlyPlayed.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentCard}
            activeOpacity={0.7}
          >
            {item.coverUrl ? (
              <Image source={{ uri: item.coverUrl }} style={styles.recentCover} resizeMode="cover" />
            ) : (
              <View style={[styles.recentCoverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="headset" size={24} color={colors.primary} />
              </View>
            )}
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
  const loadAudiobook = useAudioPlayerStore((state) => state.loadAudiobook);

  const { data: audiobooksData, isLoading } = useAudiobooks({
    language: selectedLanguage === 'all' ? undefined : selectedLanguage,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const audiobooks = audiobooksData?.data ?? [];

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
      <AudiobookCard item={item} onPress={() => handlePlayAudiobook(item.id)} />
    ),
    [handlePlayAudiobook],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('audiobook.title')}
        </Text>
      </View>

      {/* Recently Listened */}
      <RecentlyListenedSection />

      {/* Language Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedLanguage === lang.key ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => setSelectedLanguage(lang.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    selectedLanguage === lang.key ? colors.onPrimary : colors.text,
                },
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Audiobook List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : audiobooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="headset-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No audiobooks yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Audiobooks will appear here
          </Text>
        </View>
      ) : (
        <FlashList<AudiobookListItem>
          data={audiobooks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={100}
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
  // Recently Listened
  recentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 120,
  },
  recentCover: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentCoverPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentAuthor: {
    fontSize: 11,
    marginTop: 2,
  },
  // Language Filter
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Audiobook List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  audiobookCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
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
    justifyContent: 'center',
  },
  audiobookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  audiobookAuthor: {
    fontSize: 14,
    marginBottom: 2,
  },
  audiobookNarrator: {
    fontSize: 12,
    marginBottom: 6,
  },
  audiobookMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
