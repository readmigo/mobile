import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore, EnglishLevel } from '@/stores/authStore';
import { authApi } from '@/services/api/auth';

const ENGLISH_LEVELS: EnglishLevel[] = [
  'beginner',
  'elementary',
  'intermediate',
  'upperIntermediate',
  'advanced',
];

export function ProfileEditScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | undefined>(
    user?.englishLevel
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    user?.dailyGoalMinutes != null ? String(user.dailyGoalMinutes) : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setEnglishLevel(user.englishLevel);
      setDailyGoalMinutes(
        user.dailyGoalMinutes != null ? String(user.dailyGoalMinutes) : ''
      );
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError(t('profile.error.displayNameRequired', {
        defaultValue: 'Display name is required',
      }));
      return;
    }

    let goalMinutes: number | undefined;
    if (dailyGoalMinutes.trim()) {
      const parsed = parseInt(dailyGoalMinutes.trim(), 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 600) {
        setError(t('profile.error.invalidGoal', {
          defaultValue: 'Daily goal must be between 1 and 600 minutes',
        }));
        return;
      }
      goalMinutes = parsed;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await authApi.updateProfile({
        displayName: displayName.trim(),
        englishLevel,
        dailyGoalMinutes: goalMinutes,
      });
      setUser(response.data);
      router.back();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        t('profile.error.saveFailed', { defaultValue: 'Failed to save profile' });
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('profile.edit', { defaultValue: 'Edit Profile' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
              <Text style={[styles.headerAction, { color: colors.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={isSaving ? styles.headerActionDisabled : undefined}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.headerAction, styles.headerActionBold, { color: colors.primary }]}>
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('profile.basicInfo', { defaultValue: 'Basic Info' })}
            </Text>

            <View style={[styles.field, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('profile.displayName', { defaultValue: 'Display Name' })}
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('profile.displayNamePlaceholder', {
                  defaultValue: 'Your name',
                })}
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('profile.email', { defaultValue: 'Email' })}
              </Text>
              <Text style={[styles.fieldReadonly, { color: colors.textSecondary }]}>
                {user?.email ?? '-'}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('profile.readingPreferences', { defaultValue: 'Reading Preferences' })}
            </Text>

            <View style={[styles.fieldColumn, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('profile.englishLevel', { defaultValue: 'English Level' })}
              </Text>
              <View style={styles.levelChips}>
                {ENGLISH_LEVELS.map((level) => {
                  const active = englishLevel === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surfaceSecondary,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setEnglishLevel(level)}
                      disabled={isSaving}
                    >
                      <Text
                        style={[
                          styles.levelChipText,
                          { color: active ? colors.onPrimary : colors.text },
                        ]}
                      >
                        {t(`profile.level.${level}`, { defaultValue: level })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('profile.dailyGoal', { defaultValue: 'Daily Goal' })}
              </Text>
              <View style={styles.goalInputWrap}>
                <TextInput
                  style={[styles.input, styles.inputAlignRight, { color: colors.text }]}
                  value={dailyGoalMinutes}
                  onChangeText={setDailyGoalMinutes}
                  keyboardType="number-pad"
                  placeholder="20"
                  placeholderTextColor={colors.textTertiary}
                  editable={!isSaving}
                />
                <Text style={[styles.goalUnit, { color: colors.textSecondary }]}>
                  {t('profile.minutes', { defaultValue: 'min' })}
                </Text>
              </View>
            </View>
          </View>

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingVertical: 16,
    gap: 16,
  },
  headerAction: {
    paddingHorizontal: 8,
    fontSize: 15,
  },
  headerActionBold: {
    fontWeight: '600',
  },
  headerActionDisabled: {
    opacity: 0.5,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  fieldColumn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  fieldReadonly: {
    fontSize: 14,
  },
  input: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    paddingVertical: 0,
  },
  inputAlignRight: {
    minWidth: 50,
  },
  goalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalUnit: {
    fontSize: 13,
  },
  levelChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
