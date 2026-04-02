import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

const POSTHOG_API_KEY = Constants.expoConfig?.extra?.postHogApiKey || '';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let posthogClient: PostHog | null = null;

export async function initAnalytics() {
  if (!POSTHOG_API_KEY) {
    console.warn('[Analytics] No PostHog API key configured, skipping initialization');
    return;
  }

  posthogClient = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: false,
    flushAt: 20,
    flushInterval: 30000,
  });
}

export function identifyUser(userId: string, properties?: Record<string, string | number | boolean>) {
  posthogClient?.identify(userId, properties);
}

export function resetUser() {
  posthogClient?.reset();
}

export function registerSuperProperties(properties: Record<string, string | number | boolean>) {
  posthogClient?.register(properties);
}

export function setSuperProperties() {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  registerSuperProperties({
    app_version: appVersion,
    platform: Platform.OS,
    device_model: Device.modelName ?? 'unknown',
    os_version: Device.osVersion ?? 'unknown',
  });
}

// ---- Event Tracking ----

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  posthogClient?.capture(event, properties as any);
}

// Audiobook Events (aligned with iOS)
export function trackAudiobookSessionEnded(props: {
  audiobookId: string;
  audiobookTitle?: string;
  chapterIndex: number;
  positionSeconds: number;
  durationSeconds: number;
  playbackSpeed: number;
  endReason: string;
}) {
  trackEvent('audiobook_session_ended', props);
}

export function trackAudiobookChapterChanged(props: {
  audiobookId: string;
  fromChapter: number;
  toChapter: number;
  trigger: string;
}) {
  trackEvent('audiobook_chapter_changed', props);
}

export function trackAudiobookSpeedChanged(props: {
  audiobookId: string;
  fromSpeed: number;
  toSpeed: number;
}) {
  trackEvent('audiobook_speed_changed', props);
}

export function trackAudiobookLoadFailed(props: {
  audiobookId: string;
  chapterIndex: number;
  errorType: string;
}) {
  trackEvent('audiobook_load_failed', props);
}

// TTS Events (aligned with iOS)
export function trackTTSStarted(props: {
  bookId: string;
  bookTitle?: string;
  chapterIndex: number;
  voiceId?: string;
}) {
  trackEvent('tts_started', props);
}

export function trackTTSSessionEnded(props: {
  bookId: string;
  durationSeconds: number;
  paragraphsRead: number;
  voiceId?: string;
}) {
  trackEvent('tts_session_ended', props);
}

export function trackTTSVoiceSelected(props: {
  voiceType: string;
  voiceId: string;
  voiceName: string;
}) {
  trackEvent('tts_voice_selected', props);
}

// Reader Events (aligned with iOS)
export function trackReaderSettingChanged(props: {
  setting: string;
  value: string | number | boolean;
}) {
  trackEvent('reader_setting_changed', props);
}

// Onboarding Events
export function trackOnboardingStepCompleted(props: {
  step: number;
  stepName: string;
  selection?: string;
}) {
  trackEvent('onboarding_step_completed', props);
}

export function trackOnboardingCompleted(props: {
  level: string;
  dailyGoal: number;
  interestsCount: number;
}) {
  trackEvent('onboarding_completed', props);
}

export function getPostHogClient(): PostHog | null {
  return posthogClient;
}
