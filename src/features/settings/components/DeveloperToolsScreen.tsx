import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { BASE_URL } from '@/services/api/client';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  showDivider?: boolean;
}

function Row({
  label,
  value,
  onPress,
  destructive,
  showChevron,
  showDivider,
}: RowProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.row,
        showDivider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? colors.error : colors.text },
        ]}
      >
        {label}
      </Text>
      {value !== undefined && (
        <Text
          style={[styles.rowValue, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );
}

export function DeveloperToolsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    'Unknown';
  const buildNumber =
    Application.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    'Unknown';
  const env = __DEV__ ? 'Development' : 'Production';

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleClearQueryCache = () => {
    queryClient.clear();
    showStatus(
      t('dev.cleared.queryCache', { defaultValue: 'Query cache cleared' })
    );
  };

  const handleClearStorage = () => {
    Alert.alert(
      t('dev.clearStorage.title', { defaultValue: 'Clear AsyncStorage' }),
      t('dev.clearStorage.message', {
        defaultValue: 'This will remove all locally cached preferences and data. The app may behave unexpectedly until you log in again. Continue?',
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            queryClient.clear();
            showStatus(
              t('dev.cleared.storage', { defaultValue: 'Storage cleared' })
            );
          },
        },
      ]
    );
  };

  if (!__DEV__) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Stack.Screen
          options={{
            title: t('dev.title', { defaultValue: 'Developer Tools' }),
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.unavailable}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>
            {t('dev.unavailable', {
              defaultValue: 'Developer tools are only available in debug builds',
            })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('dev.title', { defaultValue: 'Developer Tools' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title={t('dev.appInfo', { defaultValue: 'App Info' })} />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Row label={t('dev.version', { defaultValue: 'Version' })} value={version} showDivider />
          <Row label={t('dev.build', { defaultValue: 'Build' })} value={buildNumber} showDivider />
          <Row label={t('dev.environment', { defaultValue: 'Environment' })} value={env} />
        </View>

        <SectionHeader title={t('dev.api', { defaultValue: 'API' })} />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Row label={t('dev.baseUrl', { defaultValue: 'Base URL' })} value={BASE_URL} />
        </View>

        <SectionHeader title={t('dev.cache', { defaultValue: 'Cache' })} />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Row
            label={t('dev.clearQueryCache', { defaultValue: 'Clear Query Cache' })}
            onPress={handleClearQueryCache}
            destructive
            showDivider
          />
          <Row
            label={t('dev.clearStorageAction', { defaultValue: 'Clear AsyncStorage' })}
            onPress={handleClearStorage}
            destructive
          />
        </View>

        {statusMessage && (
          <Text style={[styles.statusText, { color: colors.primary }]}>
            {statusMessage}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingVertical: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 6,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    maxWidth: 200,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    paddingTop: 16,
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  unavailableText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
