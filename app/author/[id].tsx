import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  colors: Record<string, string>;
}

function CollapsibleSection({ title, children, defaultExpanded = false, colors }: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[sectionStyles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={sectionStyles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[sectionStyles.title, { color: colors.text }]}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && <View style={sectionStyles.content}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    marginTop: 12,
  },
});

export default function AuthorDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock author data
  const author = {
    id,
    name: 'F. Scott Fitzgerald',
    birthYear: 1896,
    deathYear: 1940,
    nationality: 'American',
    biography:
      'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age. During his lifetime, he published four novels, four collections of short stories, and 164 short stories. Although he achieved limited success during his lifetime, he is now widely regarded as one of the greatest American writers of the 20th century.',
    writingStyle:
      'Fitzgerald\'s writing is characterized by its lyrical prose, vivid imagery, and exploration of themes such as wealth, class, love, and the American Dream. His narrative style blends romanticism with a keen social awareness, creating richly textured portrayals of the Jazz Age.',
    quotes: [
      'So we beat on, boats against the current, borne back ceaselessly into the past.',
      'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since.',
      'There are all kinds of love in this world but never the same love twice.',
      'The loneliest moment in someone\'s life is when they are watching their whole world fall apart.',
    ],
    works: [
      { id: 'gatsby-001', title: 'The Great Gatsby', year: 1925 },
      { id: 'tender-001', title: 'Tender Is the Night', year: 1934 },
      { id: 'paradise-001', title: 'This Side of Paradise', year: 1920 },
      { id: 'beautiful-001', title: 'The Beautiful and Damned', year: 1922 },
    ],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('author.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Author Avatar */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primary + '20',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              },
            ]}
          >
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
        </View>

        {/* Author Name & Info */}
        <View style={styles.nameSection}>
          <Text style={[styles.authorName, { color: colors.text }]}>{author.name}</Text>
          <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
            {author.nationality} ({author.birthYear} - {author.deathYear})
          </Text>
        </View>

        {/* Biography */}
        <CollapsibleSection
          title={t('author.biography')}
          defaultExpanded={true}
          colors={colors}
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {author.biography}
          </Text>
        </CollapsibleSection>

        {/* Writing Style */}
        <CollapsibleSection
          title={t('author.writingStyle')}
          defaultExpanded={false}
          colors={colors}
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {author.writingStyle}
          </Text>
        </CollapsibleSection>

        {/* Notable Quotes */}
        <CollapsibleSection
          title={t('author.quotes')}
          defaultExpanded={false}
          colors={colors}
        >
          {author.quotes.map((quote, index) => (
            <View
              key={index}
              style={[
                styles.quoteCard,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.quoteText, { color: colors.text }]}>
                "{quote}"
              </Text>
            </View>
          ))}
        </CollapsibleSection>

        {/* Works */}
        <View style={[sectionStyles.container, { backgroundColor: colors.surface }]}>
          <Text style={[sectionStyles.title, { color: colors.text }]}>
            {t('author.works')}
          </Text>
          <View style={{ marginTop: 12 }}>
            {author.works.map((work, index) => (
              <TouchableOpacity
                key={work.id}
                style={[
                  styles.workItem,
                  index < author.works.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
                onPress={() => router.push(`/book/${work.id}` as any)}
              >
                <View style={styles.workLeft}>
                  <View style={[styles.workCover, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="book" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.workTitle, { color: colors.text }]}>{work.title}</Text>
                    <Text style={[styles.workYear, { color: colors.textTertiary }]}>{work.year}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  authorMeta: {
    fontSize: 15,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
  },
  quoteCard: {
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  workItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  workLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workCover: {
    width: 40,
    height: 56,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  workYear: {
    fontSize: 13,
  },
});
