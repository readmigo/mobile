const mockCapture = jest.fn();
const mockIdentify = jest.fn();
const mockReset = jest.fn();
const mockRegister = jest.fn();

jest.mock('posthog-react-native', () => {
  return jest.fn().mockImplementation(() => ({
    capture: (...args: unknown[]) => mockCapture(...args),
    identify: (...args: unknown[]) => mockIdentify(...args),
    reset: (...args: unknown[]) => mockReset(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  }));
});

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { postHogApiKey: 'test-key', apiUrl: 'http://x' } } },
}));

jest.mock('expo-device', () => ({
  modelName: 'iPhone 15',
  osVersion: '17.0',
}));

import {
  initAnalytics,
  trackEvent,
  trackLoginSucceeded,
  trackSignupCompleted,
  trackBookOpened,
  trackReadingSessionEnded,
  trackSubscriptionPurchased,
  trackAudiobookSpeedChanged,
  identifyUser,
  resetUser,
  registerSuperProperties,
} from '../analytics';

beforeAll(async () => {
  await initAnalytics();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('analytics — typed events', () => {
  it('trackEvent forwards to posthog.capture', () => {
    trackEvent('foo', { a: 1, b: 'x' });
    expect(mockCapture).toHaveBeenCalledWith('foo', { a: 1, b: 'x' });
  });

  it('trackLoginSucceeded fires correct event name', () => {
    trackLoginSucceeded({ method: 'apple' });
    expect(mockCapture).toHaveBeenCalledWith('login_succeeded', { method: 'apple' });
  });

  it('trackSignupCompleted fires correct event name', () => {
    trackSignupCompleted({ method: 'google' });
    expect(mockCapture).toHaveBeenCalledWith('signup_completed', { method: 'google' });
  });

  it('trackBookOpened forwards full payload', () => {
    trackBookOpened({ bookId: 'b1', bookTitle: 'T', source: 'library' });
    expect(mockCapture).toHaveBeenCalledWith('book_opened', {
      bookId: 'b1',
      bookTitle: 'T',
      source: 'library',
    });
  });

  it('trackReadingSessionEnded forwards duration + progress', () => {
    trackReadingSessionEnded({ bookId: 'b2', durationSeconds: 120, finalProgress: 0.42 });
    expect(mockCapture).toHaveBeenCalledWith('reading_session_ended', {
      bookId: 'b2',
      durationSeconds: 120,
      finalProgress: 0.42,
    });
  });

  it('trackSubscriptionPurchased forwards productId + source', () => {
    trackSubscriptionPurchased({ productId: 'monthly', source: 'paywall', isTrial: true });
    expect(mockCapture).toHaveBeenCalledWith('subscription_purchased', {
      productId: 'monthly',
      source: 'paywall',
      isTrial: true,
    });
  });

  it('trackAudiobookSpeedChanged forwards from/to speed', () => {
    trackAudiobookSpeedChanged({ audiobookId: 'a1', fromSpeed: 1, toSpeed: 1.5 });
    expect(mockCapture).toHaveBeenCalledWith('audiobook_speed_changed', {
      audiobookId: 'a1',
      fromSpeed: 1,
      toSpeed: 1.5,
    });
  });
});

describe('analytics — user identity', () => {
  it('identifyUser forwards id + properties to posthog.identify', () => {
    identifyUser('u1', { plan: 'free' });
    expect(mockIdentify).toHaveBeenCalledWith('u1', { plan: 'free' });
  });

  it('resetUser forwards to posthog.reset', () => {
    resetUser();
    expect(mockReset).toHaveBeenCalled();
  });

  it('registerSuperProperties forwards to posthog.register', () => {
    registerSuperProperties({ subscription_tier: 'premium' });
    expect(mockRegister).toHaveBeenCalledWith({ subscription_tier: 'premium' });
  });
});
