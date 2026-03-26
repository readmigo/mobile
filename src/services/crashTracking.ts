import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';

let breadcrumbs: Array<{
  category: string;
  message: string;
  level: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
  timestamp: number;
}> = [];

const MAX_BREADCRUMBS = 100;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
    environment: __DEV__ ? 'development' : 'production',
    release: `${Constants.expoConfig?.ios?.bundleIdentifier ?? 'rn.readmigo.app'}@${Constants.expoConfig?.version ?? '1.0.0'}+${Constants.expoConfig?.ios?.buildNumber ?? '1'}`,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    maxBreadcrumbs: MAX_BREADCRUMBS,
    beforeSend(event) {
      // PII filtering: remove email from user data
      if (event.user?.email) {
        delete event.user.email;
      }
      return event;
    },
  });
}

export function addBreadcrumb(
  category: string,
  message: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>,
) {
  const crumb = { category, message, level, data, timestamp: Date.now() };
  breadcrumbs.push(crumb);
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
  }
  Sentry.addBreadcrumb({ category, message, level, data });
}

export function setUser(id: string, username?: string) {
  Sentry.setUser({ id, username });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function setReadingContext(bookId?: string, bookTitle?: string) {
  Sentry.setTag('reading.bookId', bookId ?? '');
  Sentry.setTag('reading.bookTitle', bookTitle ?? '');
}

export function reportError(error: Error, context?: Record<string, unknown>) {
  addBreadcrumb('error', error.message, 'error', context);
  Sentry.captureException(error, { extra: context });
}

export function reportMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
) {
  Sentry.captureMessage(message, { level, extra: context });
}

export { Sentry };
