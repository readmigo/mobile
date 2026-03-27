import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from './api/client';

interface VersionCheckResponse {
  data: {
    latestVersion: string;
    minVersion: string;
    updateUrl: string;
    forceUpdate: boolean;
    releaseNotes?: string;
  };
}

const APP_STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/readmigo/id0000000000', // Replace with real ID
  android: 'https://play.google.com/store/apps/details?id=com.readmigo.app',
}) ?? '';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export async function checkForUpdate(): Promise<void> {
  try {
    const currentVersion = Constants.expoConfig?.version ?? '1.0.0';
    const response: VersionCheckResponse = await apiClient.get('/app/version-check', {
      params: { platform: Platform.OS, version: currentVersion },
    });

    const { latestVersion, minVersion, updateUrl, forceUpdate, releaseNotes } = response.data;
    const storeUrl = updateUrl || APP_STORE_URL;

    // Check if force update needed (below minimum version)
    if (compareVersions(currentVersion, minVersion) < 0 || forceUpdate) {
      Alert.alert(
        'Update Required',
        releaseNotes || 'A new version is available. Please update to continue using the app.',
        [
          {
            text: 'Update Now',
            onPress: () => Linking.openURL(storeUrl),
          },
        ],
        { cancelable: false },
      );
      return;
    }

    // Check if soft update available
    if (compareVersions(currentVersion, latestVersion) < 0) {
      Alert.alert(
        'Update Available',
        releaseNotes || `Version ${latestVersion} is available with new features and improvements.`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Update',
            onPress: () => Linking.openURL(storeUrl),
          },
        ],
      );
    }
  } catch {
    // Silently fail - don't block app usage if version check fails
  }
}
