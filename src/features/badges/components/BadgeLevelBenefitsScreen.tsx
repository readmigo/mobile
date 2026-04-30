import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import {
  LEVEL_TIERS,
  LevelTier,
  getCurrentTier,
  isTierUnlocked,
  isTierCurrent,
} from '../levelTiers';

interface BadgeLevelBenefitsScreenProps {
  currentLevel?: number;
  totalPoints?: number;
  pointsToNext?: number;
}

interface TierRowProps {
  tier: LevelTier;
  level: number;
}

function TierRow({ tier, level }: TierRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unlocked = isTierUnlocked(level, tier);
  const current = isTierCurrent(level, tier);

  return (
    <View
      style={[
        styles.tierCard,
        {
          backgroundColor: current ? colors.primary + '0F' : colors.surface,
          borderColor: current ? colors.primary + '40' : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.tierIcon,
          {
            backgroundColor: unlocked ? tier.color : colors.border,
            opacity: unlocked ? 1 : 0.5,
          },
        ]}
      >
        <Ionicons name={tier.icon} size={16} color="#fff" />
      </View>

      <View style={[styles.tierBody, { opacity: unlocked ? 1 : 0.5 }]}>
        <View style={styles.tierHeader}>
          <Text style={[styles.tierRange, { color: colors.textSecondary }]}>
            {`Lv.${tier.rangeStart}-${tier.rangeEnd}`}
          </Text>
          {current && (
            <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.currentBadgeText, { color: colors.onPrimary }]}>
                {t('badge.level.current', { defaultValue: 'Current' })}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.tierTitle,
            { color: unlocked ? colors.text : colors.textSecondary },
          ]}
        >
          {t(tier.titleKey)}
        </Text>

        <View style={styles.benefitsList}>
          {tier.benefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitRow}>
              <Ionicons
                name={benefit.icon}
                size={12}
                color={unlocked ? tier.color : colors.textTertiary}
                style={styles.benefitIcon}
              />
              <Text
                style={[
                  styles.benefitText,
                  { color: unlocked ? colors.text : colors.textSecondary },
                ]}
              >
                {t(benefit.textKey)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tierStatus}>
        {unlocked ? (
          <Ionicons name="checkmark-circle" size={20} color="#43A047" />
        ) : (
          <Ionicons name="lock-closed" size={14} color={colors.textTertiary} />
        )}
      </View>
    </View>
  );
}

export function BadgeLevelBenefitsScreen({
  currentLevel = 1,
  totalPoints = 0,
  pointsToNext,
}: BadgeLevelBenefitsScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const tier = getCurrentTier(currentLevel);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('badge.level.benefits.title', { defaultValue: 'Level Benefits' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.levelLabel}>
            <Ionicons name="shield" size={20} color={colors.primary} />
            <Text style={[styles.levelText, { color: colors.text }]}>
              {`Lv.${currentLevel}`}
            </Text>
          </View>

          {tier && (
            <Text style={[styles.tierLabel, { color: colors.textSecondary }]}>
              {`${totalPoints} ${t('badge.points', { defaultValue: 'pts' })} · ${t(tier.titleKey)}`}
            </Text>
          )}

          {pointsToNext != null && pointsToNext > 0 && (
            <Text style={[styles.toNext, { color: colors.textSecondary }]}>
              {t('badge.level.pointsToNext', {
                count: pointsToNext,
                defaultValue: `${pointsToNext} pts to next level`,
              })}
            </Text>
          )}

          <Text style={[styles.formula, { color: colors.textTertiary }]}>
            {t('badge.level.formula', {
              defaultValue: 'Earn points by reading, collecting badges, and engaging',
            })}
          </Text>
        </View>

        {LEVEL_TIERS.map((tier) => (
          <TierRow key={tier.rangeStart} tier={tier} level={currentLevel} />
        ))}

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          {t('badge.level.footer', {
            defaultValue: 'Perks unlock automatically as you level up.',
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    gap: 8,
  },
  header: {
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  levelLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelText: {
    fontSize: 36,
    fontWeight: '700',
  },
  tierLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  toNext: {
    fontSize: 12,
    marginTop: 2,
  },
  formula: {
    fontSize: 11,
    marginTop: 8,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 14,
    marginBottom: 4,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBody: {
    flex: 1,
    gap: 4,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierRange: {
    fontSize: 11,
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsList: {
    gap: 4,
    marginTop: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitIcon: {
    width: 16,
  },
  benefitText: {
    fontSize: 12,
    flex: 1,
  },
  tierStatus: {
    paddingTop: 10,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});
