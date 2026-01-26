// Type declarations for missing modules

declare module '@react-native-community/slider' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  interface SliderProps {
    style?: StyleProp<ViewStyle>;
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
  }

  const Slider: React.FC<SliderProps>;
  export default Slider;
}

declare module 'react-native-purchases' {
  export interface PurchasesOffering {
    identifier: string;
    serverDescription: string;
    availablePackages: PurchasesPackage[];
    lifetime: PurchasesPackage | null;
    annual: PurchasesPackage | null;
    sixMonth: PurchasesPackage | null;
    threeMonth: PurchasesPackage | null;
    twoMonth: PurchasesPackage | null;
    monthly: PurchasesPackage | null;
    weekly: PurchasesPackage | null;
  }

  export interface PurchasesPackage {
    identifier: string;
    packageType: string;
    product: PurchasesProduct;
    offeringIdentifier: string;
  }

  export interface PurchasesProduct {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  }

  export interface CustomerInfo {
    entitlements: {
      all: Record<string, EntitlementInfo>;
      active: Record<string, EntitlementInfo>;
    };
    activeSubscriptions: string[];
    allPurchasedProductIdentifiers: string[];
    latestExpirationDate: string | null;
    firstSeen: string;
    originalAppUserId: string;
    requestDate: string;
    originalApplicationVersion: string | null;
    originalPurchaseDate: string | null;
    managementURL: string | null;
  }

  export interface EntitlementInfo {
    identifier: string;
    isActive: boolean;
    willRenew: boolean;
    periodType: string;
    latestPurchaseDate: string;
    latestPurchaseDateMillis: number;
    originalPurchaseDate: string;
    originalPurchaseDateMillis: number;
    expirationDate: string | null;
    expirationDateMillis: number | null;
    store: string;
    productIdentifier: string;
    isSandbox: boolean;
    unsubscribeDetectedAt: string | null;
    unsubscribeDetectedAtMillis: number | null;
    billingIssueDetectedAt: string | null;
    billingIssueDetectedAtMillis: number | null;
    ownershipType: string;
  }

  export interface PurchasesOfferings {
    current: PurchasesOffering | null;
    all: Record<string, PurchasesOffering>;
  }

  export const LOG_LEVEL: {
    VERBOSE: number;
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
  };

  interface Purchases {
    configure(options: { apiKey: string; appUserID?: string }): Promise<void>;
    setLogLevel(level: number): void;
    getOfferings(): Promise<PurchasesOfferings>;
    getCustomerInfo(): Promise<CustomerInfo>;
    purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo }>;
    restorePurchases(): Promise<CustomerInfo>;
    logIn(appUserID: string): Promise<{ customerInfo: CustomerInfo }>;
    logOut(): Promise<CustomerInfo>;
    addCustomerInfoUpdateListener(callback: (customerInfo: CustomerInfo) => void): void;
  }

  const Purchases: Purchases;
  export default Purchases;
}
