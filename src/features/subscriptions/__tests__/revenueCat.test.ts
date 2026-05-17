import Purchases from 'react-native-purchases';
import {
  getOfferings,
  getSubscriptionInfo,
  initializeRevenueCat,
} from '../services/revenueCat';

const mockedPurchases = Purchases as unknown as {
  getOfferings: jest.Mock;
  getCustomerInfo: jest.Mock;
  configure: jest.Mock;
};

describe('revenueCat service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOfferings -> parseOffering', () => {
    it('returns empty array when current offering is null', async () => {
      mockedPurchases.getOfferings.mockResolvedValueOnce({ current: null, all: {} });
      const result = await getOfferings();
      expect(result).toEqual([]);
    });

    it('maps weekly/monthly/annual packages to weekly/monthly/yearly durations', async () => {
      mockedPurchases.getOfferings.mockResolvedValueOnce({
        current: {
          identifier: 'default',
          serverDescription: '',
          availablePackages: [],
          lifetime: null,
          annual: makePackage('annual_pkg', 'rn.readmigo.app.pro.yearly', 59.99, 'USD', '$59.99'),
          sixMonth: null,
          threeMonth: null,
          twoMonth: null,
          monthly: makePackage('monthly_pkg', 'rn.readmigo.app.pro.monthly', 9.99, 'USD', '$9.99'),
          weekly: makePackage('weekly_pkg', 'rn.readmigo.app.pro.weekly', 2.99, 'USD', '$2.99'),
        },
        all: {},
      });

      const result = await getOfferings();

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.duration)).toEqual(['weekly', 'monthly', 'yearly']);
      expect(result[2].isBestValue).toBe(true);
      expect(result.find((p) => p.duration === 'yearly')?.pricePerMonth).toBe('USD 5.00/mo');
    });

    it('ignores lifetime/sixMonth/threeMonth/twoMonth packages', async () => {
      mockedPurchases.getOfferings.mockResolvedValueOnce({
        current: {
          identifier: 'default',
          serverDescription: '',
          availablePackages: [],
          lifetime: makePackage('lifetime_pkg', 'rn.readmigo.app.pro.lifetime', 199, 'USD', '$199'),
          annual: null,
          sixMonth: null,
          threeMonth: null,
          twoMonth: null,
          monthly: makePackage('monthly_pkg', 'rn.readmigo.app.pro.monthly', 9.99, 'USD', '$9.99'),
          weekly: null,
        },
        all: {},
      });

      const result = await getOfferings();

      expect(result.map((p) => p.duration)).toEqual(['monthly']);
    });
  });

  describe('getSubscriptionInfo -> parseCustomerInfo', () => {
    it('returns free tier when no pro entitlement is active', async () => {
      mockedPurchases.getCustomerInfo.mockResolvedValueOnce({
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
      });

      const info = await getSubscriptionInfo();
      expect(info).toEqual({
        tier: 'free',
        isActive: false,
        expirationDate: null,
        willRenew: false,
        productId: null,
      });
    });

    it('returns pro tier when pro entitlement is active', async () => {
      mockedPurchases.getCustomerInfo.mockResolvedValueOnce({
        entitlements: {
          active: {
            pro: {
              identifier: 'pro',
              isActive: true,
              willRenew: true,
              periodType: 'NORMAL',
              latestPurchaseDate: '2026-05-17T00:00:00Z',
              latestPurchaseDateMillis: 1747440000000,
              originalPurchaseDate: '2026-05-17T00:00:00Z',
              originalPurchaseDateMillis: 1747440000000,
              expirationDate: '2027-05-17T00:00:00Z',
              expirationDateMillis: 1778976000000,
              store: 'APP_STORE',
              productIdentifier: 'rn.readmigo.app.pro.yearly',
              isSandbox: true,
              unsubscribeDetectedAt: null,
              unsubscribeDetectedAtMillis: null,
              billingIssueDetectedAt: null,
              billingIssueDetectedAtMillis: null,
              ownershipType: 'PURCHASED',
            },
          },
          all: {},
        },
        activeSubscriptions: ['rn.readmigo.app.pro.yearly'],
        allPurchasedProductIdentifiers: ['rn.readmigo.app.pro.yearly'],
        latestExpirationDate: '2027-05-17T00:00:00Z',
        firstSeen: '2026-05-17T00:00:00Z',
        originalAppUserId: 'user_123',
        requestDate: '2026-05-17T00:00:00Z',
        originalApplicationVersion: '1.0.0',
        originalPurchaseDate: '2026-05-17T00:00:00Z',
        managementURL: 'https://apps.apple.com/account/subscriptions',
      });

      const info = await getSubscriptionInfo();
      expect(info).toEqual({
        tier: 'pro',
        isActive: true,
        expirationDate: '2027-05-17T00:00:00Z',
        willRenew: true,
        productId: 'rn.readmigo.app.pro.yearly',
      });
    });

    it('returns free tier on getCustomerInfo throw (catch path)', async () => {
      mockedPurchases.getCustomerInfo.mockRejectedValueOnce(new Error('network'));
      const info = await getSubscriptionInfo();
      expect(info.tier).toBe('free');
    });
  });

  describe('initializeRevenueCat', () => {
    it('early-returns without API key', async () => {
      // Constants.expoConfig is mocked in jest.setup.js with only apiUrl; no RC keys -> early return.
      await initializeRevenueCat('user_123');
      expect(mockedPurchases.configure).not.toHaveBeenCalled();
    });
  });
});

function makePackage(
  identifier: string,
  productId: string,
  price: number,
  currencyCode: string,
  priceString: string,
) {
  return {
    identifier,
    packageType: identifier.toUpperCase(),
    offeringIdentifier: 'default',
    product: {
      identifier: productId,
      description: '',
      title: '',
      price,
      priceString,
      currencyCode,
    },
  };
}
