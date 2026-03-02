import { init, track, identify, reset, Identify } from '@amplitude/analytics-react-native';
import Constants from 'expo-constants';

const API_KEY = (Constants.expoConfig?.extra?.amplitudeApiKey as string | undefined) ?? '';

let initialized = false;

export function initAmplitude(): void {
  if (!API_KEY) {
    return;
  }
  if (initialized) {
    return;
  }

  init(API_KEY, undefined, {
    autocapture: {
      sessions: true,
      screenViews: true,
    },
  });

  initialized = true;
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!initialized) {
    return;
  }
  track(name, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!initialized) {
    return;
  }

  const identifyObj = new Identify();

  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      identifyObj.set(key, value as string | number | boolean | string[]);
    });
  }

  identify(identifyObj, { user_id: userId });
}

export function setUserProperties(properties: Record<string, unknown>): void {
  if (!initialized) {
    return;
  }

  const identifyObj = new Identify();

  Object.entries(properties).forEach(([key, value]) => {
    identifyObj.set(key, value as string | number | boolean | string[]);
  });

  identify(identifyObj);
}

export function resetAmplitude(): void {
  if (!initialized) {
    return;
  }
  reset();
}
