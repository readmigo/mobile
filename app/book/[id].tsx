import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export default function BookDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chaptersExpanded, setChaptersExpanded] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);

  // Mock book data
  const book = {
    id,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    authorId: 'fitzgerald-001',
    description:
      'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
    category: 'Classics',
    difficulty: 3,
    pageCount: 180,
    language: 'English',
    isFree: true,
    hasAudiobook: true,
    progress: 0.35,
    chapters: [
      { id: '1', title: 'Chapter 1', wordCount: 3500 },
      { id: '2', title: 'Chapter 2', wordCount: 4200 },
      { id: '3', title: 'Chapter 3', wordCount: 3800 },
      { id: '4', title: 'Chapter 4', wordCount: 4100 },
      { id: '5', title: 'Chapter 5', wordCount: 3600 },
      { id: '6', title: 'Chapter 6', wordCount: 3900 },
      { id: '7', title: 'Chapter 7', wordCount: 5200 },
      { id: '8', title: 'Chapter 8', wordCount: 4500 },
      { id: '9', title: 'Chapter 9', wordCount: 3700 },
    ],
  };

  const handleStartReading = () => {
    router.push({
      pathname: '/book/reader',
      params: { bookId: id },
    });
  };

  const handleListenAudiobook = () => {
    router.push({
      pathname: '/(tabs)/audiobook' as any,
      params: { bookId: id },
    });
  };

  const handleAuthorPress = () => {
    router.push(`/author/${book.authorId}` as any);
  };

  const visibleChapters = chaptersExpanded ? book.chapters : book.chapters.slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Book Cover */}
        <View style={styles.coverSection}>
          <View
            style={[
              styles.cover,
              {
                backgroundColor: colors.primary + '20',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              },
            ]}
          >
            <Ionicons name="book" size={56} color={colors.primary} />
          </View>
        </View>

        {/* Title & Author */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <TouchableOpacity onPress={handleAuthorPress}>
            <Text style={[styles.authorLink, { color: colors.primary }]}>{book.author}</Text>
          </TouchableOpacity>
        </View>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {t('book.pages', { count: book.pageCount })}
            </Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              {t('book.difficulty')}
            </Text>
            <View style={styles.difficultyDots}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.difficultyDot,
                    {
                      backgroundColor:
                        i < book.difficulty ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {book.language}
            </Text>
          </View>
        </View>

        {/* Progress (if reading) */}
        {book.progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t('library.continueReading')}
              </Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>
                {Math.round(book.progress * 100)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: `${book.progress * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartReading}
          >
            <Ionicons name="book-outline" size={20} color={colors.onPrimary} />
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              {book.progress > 0 ? t('book.continueReading') : t('book.startReading')}
            </Text>
          </TouchableOpacity>

          {book.hasAudiobook && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={handleListenAudiobook}
            >
              <Ionicons name="headset-outline" size={20} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                {t('audiobook.play')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('book.about')}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {book.description}
          </Text>
        </View>

        {/* Chapters Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setChaptersExpanded(!chaptersExpanded)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('book.chapters')}
            </Text>
            <Ionicons
              name={chaptersExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {visibleChapters.map((chapter, index) => (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterItem,
                index < visibleChapters.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.chapterLeft}>
                <Text style={[styles.chapterNumber, { color: colors.textTertiary }]}>
                  {chapter.id}
                </Text>
                <Text style={[styles.chapterTitle, { color: colors.text }]}>
                  {chapter.title}
                </Text>
              </View>
              <Text style={[styles.chapterMeta, { color: colors.textTertiary }]}>
                {t('book.words', { count: chapter.wordCount })}
              </Text>
            </TouchableOpacity>
          ))}
          {!chaptersExpanded && book.chapters.length > 3 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setChaptersExpanded(true)}
            >
              <Text style={[styles.showMoreText, { color: colors.primary }]}>
                {t('library.seeAll')} ({book.chapters.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Library Action */}
        <View style={styles.libraryActionSection}>
          <TouchableOpacity
            style={[
              styles.libraryButton,
              {
                backgroundColor: inLibrary ? colors.error + '15' : colors.primary + '15',
                borderColor: inLibrary ? colors.error : colors.primary,
              },
            ]}
            onPress={() => setInLibrary(!inLibrary)}
          >
            <Ionicons
              name={inLibrary ? 'remove-circle-outline' : 'add-circle-outline'}
              size={20}
              color={inLibrary ? colors.error : colors.primary}
            />
            <Text
              style={[
                styles.libraryButtonText,
                { color: inLibrary ? colors.error : colors.primary },
              ]}
            >
              {inLibrary ? t('book.removeFromLibrary') : t('book.addToLibrary')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cover: {
    width: 200,
    height: 300,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  authorLink: {
    fontSize: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#ccc',
    marginHorizontal: 12,
  },
  metaLabel: {
    fontSize: 13,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 3,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: '500',
    width: 20,
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 15,
  },
  chapterMeta: {
    fontSize: 12,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingTop: 12,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  libraryActionSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  libraryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
