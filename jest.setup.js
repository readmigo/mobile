require('@testing-library/jest-native/extend-expect');

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { apiUrl: 'https://api.test.readmigo.app' } },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'en-US', languageCode: 'en' }],
  locale: 'en-US',
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('react-native-purchases', () => {
  const emptyCustomerInfo = {
    entitlements: { active: {}, all: {} },
    activeSubscriptions: [],
    allPurchasedProductIdentifiers: [],
    latestExpirationDate: null,
    firstSeen: '',
    originalAppUserId: '',
    requestDate: '',
    originalApplicationVersion: null,
    originalPurchaseDate: null,
    managementURL: null,
  };

  const mockPurchases = {
    configure: jest.fn(() => Promise.resolve()),
    setLogLevel: jest.fn(),
    logIn: jest.fn(() => Promise.resolve({ customerInfo: emptyCustomerInfo })),
    logOut: jest.fn(() => Promise.resolve(emptyCustomerInfo)),
    getOfferings: jest.fn(() => Promise.resolve({ current: null, all: {} })),
    getCustomerInfo: jest.fn(() => Promise.resolve(emptyCustomerInfo)),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockPurchases,
    LOG_LEVEL: { VERBOSE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4 },
  };
});

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useNativeDriver')) return;
  originalWarn(...args);
};
