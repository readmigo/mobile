import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REVENUECAT_API_KEY_IOS = Constants.expoConfig?.extra?.revenueCatApiKeyIos || '';
const REVENUECAT_API_KEY_ANDROID = Constants.expoConfig?.extra?.revenueCatApiKeyAndroid || '';

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productId: string | null;
}

export interface SubscriptionPackage {
  id: string;
  title: string;
  description: string;
  price: string;
  pricePerMonth: string;
  duration: 'monthly' | 'yearly' | 'lifetime';
  product: PurchasesPackage;
  isBestValue?: boolean;
}

let isInitialized = false;

export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isInitialized) return;

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });

    if (userId) {
      await Purchases.logIn(userId);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

export async function loginUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Failed to login to RevenueCat:', error);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to logout from RevenueCat:', error);
  }
}

export async function getOfferings(): Promise<SubscriptionPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      return [];
    }

    return parseOffering(currentOffering);
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
}

function parseOffering(offering: PurchasesOffering): SubscriptionPackage[] {
  const packages: SubscriptionPackage[] = [];

  // Monthly package
  if (offering.monthly) {
    packages.push({
      id: offering.monthly.identifier,
      title: 'Monthly',
      description: 'Billed monthly',
      price: offering.monthly.product.priceString,
      pricePerMonth: offering.monthly.product.priceString,
      duration: 'monthly',
      product: offering.monthly,
    });
  }

  // Yearly package
  if (offering.annual) {
    const yearlyPrice = offering.annual.product.price;
    const monthlyEquivalent = yearlyPrice / 12;
    packages.push({
      id: offering.annual.identifier,
      title: 'Yearly',
      description: 'Billed annually, save 40%',
      price: offering.annual.product.priceString,
      pricePerMonth: `${offering.annual.product.currencyCode} ${monthlyEquivalent.toFixed(2)}/mo`,
      duration: 'yearly',
      product: offering.annual,
      isBestValue: true,
    });
  }

  // Lifetime package
  if (offering.lifetime) {
    packages.push({
      id: offering.lifetime.identifier,
      title: 'Lifetime',
      description: 'One-time purchase',
      price: offering.lifetime.product.priceString,
      pricePerMonth: 'Forever',
      duration: 'lifetime',
      product: offering.lifetime,
    });
  }

  return packages;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return await Purchases.getCustomerInfo();
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo);
  } catch (error) {
    console.error('Failed to get subscription info:', error);
    return {
      tier: 'free',
      isActive: false,
      expirationDate: null,
      willRenew: false,
      productId: null,
    };
  }
}

function parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionInfo {
  const premiumEntitlement = customerInfo.entitlements.active['premium'];
  const premiumPlusEntitlement = customerInfo.entitlements.active['premium_plus'];

  if (premiumPlusEntitlement) {
    return {
      tier: 'premium_plus',
      isActive: true,
      expirationDate: premiumPlusEntitlement.expirationDate,
      willRenew: premiumPlusEntitlement.willRenew,
      productId: premiumPlusEntitlement.productIdentifier,
    };
  }

  if (premiumEntitlement) {
    return {
      tier: 'premium',
      isActive: true,
      expirationDate: premiumEntitlement.expirationDate,
      willRenew: premiumEntitlement.willRenew,
      productId: premiumEntitlement.productIdentifier,
    };
  }

  return {
    tier: 'free',
    isActive: false,
    expirationDate: null,
    willRenew: false,
    productId: null,
  };
}

export function addCustomerInfoUpdateListener(
  callback: (info: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    // RevenueCat doesn't have a remove listener, but we can return a no-op
  };
}
