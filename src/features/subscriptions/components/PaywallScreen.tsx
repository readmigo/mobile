import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useOfferings, usePurchase, useRestorePurchases } from '../hooks/useSubscription';
import { SubscriptionPackage } from '../services/revenueCat';
import { Button } from '@/components/ui/Button';

const FEATURES = [
  { icon: 'sparkles', title: 'AI Explanations', description: 'Get instant word and phrase explanations' },
  { icon: 'book', title: 'Unlimited Books', description: 'Access our entire library' },
  { icon: 'headset', title: 'Audiobooks', description: 'Listen while you read' },
  { icon: 'language', title: 'Translation', description: 'Translate any text instantly' },
  { icon: 'cloud-download', title: 'Offline Mode', description: 'Read without internet' },
];

export function PaywallScreen() {
  const { colors } = useTheme();
  const { data: offerings, isLoading: loadingOfferings } = useOfferings();
  const purchase = usePurchase();
  const restore = useRestorePurchases();
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      await purchase.mutateAsync(selectedPackage.product);
      router.back();
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase failed:', error);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore.mutateAsync();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const isLoading = loadingOfferings || purchase.isPending || restore.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="rocket" size={40} color={colors.onPrimary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Unlock Premium</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Get unlimited access to all features and accelerate your learning
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Packages */}
        {loadingOfferings ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.packages}>
            {offerings?.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedPackage?.id === pkg.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.7}
              >
                {pkg.isBestValue && (
                  <View style={[styles.bestValueBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                )}
                <View style={styles.packageHeader}>
                  <Text style={[styles.packageTitle, { color: colors.text }]}>{pkg.title}</Text>
                  <Text style={[styles.packagePrice, { color: colors.primary }]}>{pkg.price}</Text>
                </View>
                <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>
                  {pkg.description}
                </Text>
                {pkg.duration !== 'monthly' && pkg.duration !== 'lifetime' && (
                  <Text style={[styles.packagePerMonth, { color: colors.textTertiary }]}>
                    {pkg.pricePerMonth}
                  </Text>
                )}
                {selectedPackage?.id === pkg.id && (
                  <View style={[styles.selectedCheck, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            title={purchase.isPending ? 'Processing...' : 'Continue'}
            onPress={handlePurchase}
            disabled={!selectedPackage || isLoading}
            loading={purchase.isPending}
            fullWidth
          />
          <TouchableOpacity
            onPress={handleRestore}
            disabled={restore.isPending}
            style={styles.restoreBtn}
          >
            <Text style={[styles.restoreText, { color: colors.primary }]}>
              {restore.isPending ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.textTertiary }]}>
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current
          period. Manage subscriptions in your App Store settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  loader: {
    marginVertical: 40,
  },
  packages: {
    marginBottom: 24,
  },
  packageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  packagePrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  packageDesc: {
    fontSize: 13,
  },
  packagePerMonth: {
    fontSize: 12,
    marginTop: 4,
  },
  selectedCheck: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cta: {
    marginBottom: 16,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
  },
  terms: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
