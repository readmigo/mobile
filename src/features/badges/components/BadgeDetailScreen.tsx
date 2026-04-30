import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { badgesApi, Badge } from '@/services/api/badges';

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BadgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => (await badgesApi.getBadges()).data,
  });

  const badge: Badge | undefined = badges?.find((b) => b.id === id);

  const handleShare = async () => {
    if (!badge) return;
    const message = t('badge.shareMessage', {
      name: badge.name,
      description: badge.description,
      defaultValue: `I just earned the “${badge.name}” badge on Readmigo!\n${badge.description}`,
    });
    try {
      await Share.share({ message, title: badge.name });
    } catch {
      // Cancelled.
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: badge?.name ?? t('badge.title', { defaultValue: 'Badge' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !badge ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {t('badge.notFound', { defaultValue: 'Badge not found' })}
          </Text>
        </View>
      ) : (
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroWrap}>
              <LinearGradient
                colors={
                  badge.isUnlocked
                    ? ['#FFE082', '#FFB300', '#FF8F00']
                    : ['#E0E0E0', '#BDBDBD', '#9E9E9E']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroInner}>
                  {badge.iconUrl ? (
                    <Image
                      source={{ uri: badge.iconUrl }}
                      style={[styles.heroImage, !badge.isUnlocked && styles.locked]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name={badge.isUnlocked ? 'trophy' : 'lock-closed'}
                      size={96}
                      color="#fff"
                    />
                  )}
                </View>
              </LinearGradient>

              {badge.isUnlocked && (
                <View style={[styles.statusPill, { backgroundColor: '#43A047' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.statusPillText}>
                    {t('badges.unlocked', { defaultValue: 'Unlocked' })}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{badge.name}</Text>

            {badge.category && (
              <Text style={[styles.category, { color: colors.textSecondary }]}>
                {badge.category}
              </Text>
            )}

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {badge.description}
            </Text>

            {badge.isUnlocked && badge.unlockedAt && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  {t('badge.earnedOn', {
                    date: formatDate(badge.unlockedAt, i18n.language),
                    defaultValue: `Earned on ${formatDate(badge.unlockedAt, i18n.language)}`,
                  })}
                </Text>
              </View>
            )}

            {!badge.isUnlocked && badge.progress != null && (
              <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.text }]}>
                    {t('badge.progress', { defaultValue: 'Progress' })}
                  </Text>
                  <Text style={[styles.progressValue, { color: colors.primary }]}>
                    {Math.round((badge.progress ?? 0) * 100)}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.round((badge.progress ?? 0) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                {badge.requirement && (
                  <Text style={[styles.requirement, { color: colors.textSecondary }]}>
                    {badge.requirement}
                  </Text>
                )}
              </View>
            )}

            {badge.isUnlocked && (
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primary }]}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Ionicons name="share-outline" size={18} color={colors.onPrimary} />
                <Text style={[styles.shareButtonText, { color: colors.onPrimary }]}>
                  {t('badge.share', { defaultValue: 'Share' })}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  heroGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  heroInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 110,
    height: 110,
  },
  locked: {
    opacity: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: -10,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  progressCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  requirement: {
    fontSize: 12,
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginTop: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
