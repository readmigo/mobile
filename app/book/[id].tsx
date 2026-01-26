import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function BookDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Placeholder book data
  const book = {
    id,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
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
    ],
  };

  const handleStartReading = () => {
    router.push({
      pathname: '/book/reader',
      params: { bookId: id },
    });
  };

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
          <View style={[styles.cover, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="book" size={48} color={colors.primary} />
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{book.author}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {book.pageCount} pages
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {book.language}
              </Text>
            </View>
            {book.hasAudiobook && (
              <View style={styles.metaItem}>
                <Ionicons name="headset-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Audio</Text>
              </View>
            )}
          </View>

          {/* Difficulty */}
          <View style={styles.difficultyRow}>
            <Text style={[styles.difficultyLabel, { color: colors.textSecondary }]}>
              Difficulty:
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

          {/* Progress */}
          {book.progress > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Your Progress
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
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {book.description}
          </Text>
        </View>

        {/* Chapters */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chapters</Text>
          {book.chapters.map((chapter, index) => (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterItem,
                index < book.chapters.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.chapterTitle, { color: colors.text }]}>
                {chapter.title}
              </Text>
              <Text style={[styles.chapterMeta, { color: colors.textTertiary }]}>
                {chapter.wordCount.toLocaleString()} words
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.readButton, { backgroundColor: colors.primary }]}
          onPress={handleStartReading}
        >
          <Text style={[styles.readButtonText, { color: colors.onPrimary }]}>
            {book.progress > 0 ? 'Continue Reading' : 'Start Reading'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  coverSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cover: {
    width: 150,
    height: 220,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 14,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
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
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  chapterItem: {
    paddingVertical: 12,
  },
  chapterTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  chapterMeta: {
    fontSize: 12,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  readButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  readButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
