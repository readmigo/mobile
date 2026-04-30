import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ShareCardContent } from '../types';
import { ShareCardThemeColors } from '../theme';

interface ShareCardBodyProps {
  content: ShareCardContent;
  theme: ShareCardThemeColors;
}

function dynamicFontSize(text: string): number {
  const len = text.length;
  if (len > 300) return 15;
  if (len > 200) return 17;
  if (len > 100) return 19;
  return 21;
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ShareCardBody({ content, theme }: ShareCardBodyProps) {
  const { i18n } = useTranslation();
  const dateText = formatDate(new Date(), i18n.language);
  const fontSize = dynamicFontSize(content.text);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text
        style={[styles.date, { color: theme.secondary }]}
      >
        {dateText}
      </Text>

      <Text
        style={[styles.openQuote, { color: theme.accent }]}
      >
        {'“'}
      </Text>

      <Text
        style={[styles.quoteText, { color: theme.text, fontSize }]}
      >
        {content.text}
      </Text>

      <Text
        style={[styles.closeQuote, { color: theme.accent }]}
      >
        {'”'}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.accent }]} />

      {content.bookTitle ? (
        <View style={styles.bookRow}>
          <Ionicons name="book" size={12} color={theme.text} />
          <Text style={[styles.bookTitle, { color: theme.text }]}>
            {content.bookTitle}
          </Text>
        </View>
      ) : null}

      {content.author ? (
        <Text
          style={[styles.author, { color: theme.secondary }]}
        >
          {`— ${content.author}`}
        </Text>
      ) : null}

      <View style={styles.brandRow}>
        <Text style={[styles.brandStar, { color: theme.secondary }]}>✦</Text>
        <Text style={[styles.brand, { color: theme.secondary }]}>Readmigo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    paddingHorizontal: 32,
    paddingVertical: 32,
    overflow: 'hidden',
  },
  date: {
    fontSize: 11,
    fontWeight: '400',
  },
  openQuote: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 16,
    lineHeight: 38,
  },
  quoteText: {
    lineHeight: undefined,
    fontWeight: '400',
    marginTop: 2,
  },
  closeQuote: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'right',
    lineHeight: 38,
    marginTop: 2,
  },
  divider: {
    width: 40,
    height: 1.5,
    marginTop: 16,
    marginBottom: 16,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  author: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    paddingLeft: 20,
  },
  brandRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  brandStar: {
    fontSize: 9,
  },
  brand: {
    fontSize: 11,
    fontWeight: '500',
  },
});
