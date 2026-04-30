import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TipCardProps {
  icon: IoniconName;
  title: string;
  description: string;
}

function TipCard({ icon, title, description }: TipCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.tipIconWrap, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.tipBody}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export function BookshelfEmptyView() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons name="library-outline" size={64} color={colors.textTertiary} />

      <View style={styles.headings}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('bookshelf.empty.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('bookshelf.empty.subtitle')}
        </Text>
      </View>

      <View style={styles.tips}>
        <TipCard
          icon="add-circle-outline"
          title={t('bookshelf.tip.add.title')}
          description={t('bookshelf.tip.add.description')}
        />
        <TipCard
          icon="swap-vertical-outline"
          title={t('bookshelf.tip.sort.title')}
          description={t('bookshelf.tip.sort.description')}
        />
        <TipCard
          icon="checkmark-circle-outline"
          title={t('bookshelf.tip.edit.title')}
          description={t('bookshelf.tip.edit.description')}
        />
      </View>

      <TouchableOpacity
        style={[styles.discoverButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={[styles.discoverButtonText, { color: colors.onPrimary }]}>
          {t('library.discoverBooks')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  headings: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  tips: {
    width: '100%',
    gap: 10,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipDescription: {
    fontSize: 12,
  },
  discoverButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 4,
  },
  discoverButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
