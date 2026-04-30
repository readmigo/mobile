import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, Language } from '@/stores/settingsStore';

interface LanguageOption {
  id: Language;
  flag: string;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', flag: '🇺🇸', name: 'English' },
  { id: 'zh-Hans', flag: '🇨🇳', name: '简体中文' },
  { id: 'zh-Hant', flag: '🇹🇼', name: '繁體中文' },
  { id: 'ja', flag: '🇯🇵', name: '日本語' },
  { id: 'ko', flag: '🇰🇷', name: '한국어' },
  { id: 'es', flag: '🇪🇸', name: 'Español' },
  { id: 'fr', flag: '🇫🇷', name: 'Français' },
  { id: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { id: 'pt', flag: '🇵🇹', name: 'Português' },
  { id: 'ru', flag: '🇷🇺', name: 'Русский' },
  { id: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { id: 'ar', flag: '🇸🇦', name: 'العربية' },
  { id: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { id: 'uk', flag: '🇺🇦', name: 'Українська' },
  { id: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
];

export function LanguageSettingsScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  const handleSelect = async (lang: Language) => {
    setLanguage(lang);
    await i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('profile.language', { defaultValue: 'Language' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t('settings.chooseLanguage', { defaultValue: 'Choose Language' })}
        </Text>

        <View style={[styles.list, { backgroundColor: colors.surface }]}>
          {LANGUAGES.map((lang, idx) => {
            const selected = language === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.row,
                  idx < LANGUAGES.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleSelect(lang.id)}
                activeOpacity={0.6}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[styles.langName, { color: colors.text }]}>
                  {lang.name}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  list: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  flag: {
    fontSize: 22,
  },
  langName: {
    flex: 1,
    fontSize: 15,
  },
});
