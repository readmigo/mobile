import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      initialRouteName="discover"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: t('library.title'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'library' : 'library-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('discover.title'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'storefront' : 'storefront-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="audiobook"
        options={{
          title: t('audiobook.title'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'headset' : 'headset-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('me.title'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
