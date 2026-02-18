import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from 'react-i18next';

type IconName = keyof typeof Ionicons.glyphMap;

type SettingItem = {
  id: string;
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export default function MeScreen() {
  const { colors } = useTheme();
  const { user, isGuestMode, logout } = useAuth();
  const { themeMode, setThemeMode } = useSettingsStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('me.logoutConfirm', { defaultValue: 'Are you sure you want to log out?' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.logout'), style: 'destructive', onPress: logout },
      ],
    );
  };

  const contactUsSection: SettingItem[] = [
    {
      id: 'contact',
      icon: 'chatbubble-outline',
      title: t('me.contactUs', { defaultValue: 'Contact Us' }),
      onPress: () => {},
    },
  ];

  const legalSection: SettingItem[] = [
    {
      id: 'privacy',
      icon: 'shield-checkmark-outline',
      title: t('profile.privacyPolicy'),
      onPress: () => Linking.openURL('https://readmigo.app/privacy'),
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      title: t('profile.termsOfService'),
      onPress: () => Linking.openURL('https://readmigo.app/terms'),
    },
    {
      id: 'agreement',
      icon: 'reader-outline',
      title: t('me.userAgreement', { defaultValue: 'User Agreement' }),
      onPress: () => Linking.openURL('https://readmigo.app/agreement'),
    },
  ];

  const aboutSection: SettingItem[] = [
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: t('profile.about'),
      onPress: () => {},
    },
  ];

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    { title: t('me.contactUsSection', { defaultValue: 'Contact Us' }), items: contactUsSection },
    { title: t('me.legalSection', { defaultValue: 'Legal' }), items: legalSection },
    { title: t('profile.about'), items: aboutSection },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
              {isGuestMode ? 'G' : user?.displayName?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {isGuestMode ? t('profile.guestUser') : user?.displayName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {isGuestMode ? t('profile.signInToSync') : user?.email || ''}
            </Text>
          </View>
          {isGuestMode ? (
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={[styles.signInText, { color: colors.onPrimary }]}>
                {t('profile.signIn')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon} size={22} color={colors.text} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Account Section - Sign Out */}
        {!isGuestMode && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('profile.account')}
            </Text>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.surface }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>
                {t('auth.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});
