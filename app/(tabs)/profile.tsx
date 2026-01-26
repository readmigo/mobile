import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/stores/settingsStore';

type SettingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, isGuestMode, logout } = useAuth();
  const { themeMode, setThemeMode } = useSettingsStore();

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'theme',
          icon: 'moon-outline',
          title: 'Theme',
          subtitle: themeMode.charAt(0).toUpperCase() + themeMode.slice(1),
          onPress: () => {
            const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
            const currentIndex = modes.indexOf(themeMode);
            setThemeMode(modes[(currentIndex + 1) % modes.length]);
          },
        },
        {
          id: 'language',
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'English',
          onPress: () => {},
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Notifications',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Reading',
      items: [
        {
          id: 'reader',
          icon: 'text-outline',
          title: 'Reader Settings',
          onPress: () => {},
        },
        {
          id: 'goal',
          icon: 'flag-outline',
          title: 'Daily Goal',
          subtitle: '20 words/day',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'subscription',
          icon: 'diamond-outline',
          title: 'Subscription',
          subtitle: user?.subscriptionTier === 'premium' ? 'Premium' : 'Free',
          onPress: () => {},
        },
        {
          id: 'help',
          icon: 'help-circle-outline',
          title: 'Help & Support',
          onPress: () => {},
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          title: 'About',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
              {isGuestMode ? 'G' : user?.displayName?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {isGuestMode ? 'Guest User' : user?.displayName || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {isGuestMode ? 'Sign in to sync your data' : user?.email || ''}
            </Text>
          </View>
          {isGuestMode && (
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={[styles.signInText, { color: colors.onPrimary }]}>
                Sign In
              </Text>
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
                      borderBottomWidth: 1,
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

        {/* Logout Button */}
        {!isGuestMode && (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface }]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
          </TouchableOpacity>
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
  userCard: {
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
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
