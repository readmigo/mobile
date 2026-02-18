import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithApple,
  isAppleAuthAvailable,
} from '@/features/auth/services/appleAuth';
import {
  useGoogleAuth,
  parseGoogleResponse,
} from '@/features/auth/services/googleAuth';

const TERMS_URL = 'https://readmigo.app/terms';
const PRIVACY_URL = 'https://readmigo.app/privacy';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { socialLogin, enterGuestMode, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  // Google Auth hook
  const { response: googleResponse, promptAsync: promptGoogleAsync, isReady: googleReady } = useGoogleAuth();

  // Check Apple auth availability
  useEffect(() => {
    isAppleAuthAvailable().then(setAppleAuthAvailable);
  }, []);

  // Run animations on mount
  useEffect(() => {
    // Logo spring animation: scale 0.8 -> 1.0
    Animated.spring(logoScale, {
      toValue: 1.0,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Content fade-in: opacity 0 -> 1, delay 0.3s
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle Google auth response
  useEffect(() => {
    if (googleResponse) {
      handleGoogleResponse();
    }
  }, [googleResponse]);

  const handleGoogleResponse = async () => {
    if (!googleResponse) return;

    setSigningIn(true);
    setError(null);

    try {
      const result = await parseGoogleResponse(googleResponse);
      if (result) {
        await socialLogin({
          provider: 'google',
          idToken: result.idToken,
        });
        router.replace('/(tabs)/library');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign In failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setSigningIn(true);

    try {
      const result = await signInWithApple();
      await socialLogin({
        provider: 'apple',
        idToken: result.idToken,
        nonce: result.nonce,
      });
      router.replace('/(tabs)/library');
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setError(err.message || 'Apple Sign In failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!googleReady) {
      setError('Google Sign In is not ready. Please try again.');
      return;
    }
    await promptGoogleAsync();
  };

  const handleEmailSignIn = () => {
    // TODO: Navigate to email sign-in screen when implemented
    router.push('/(auth)/email-login' as any);
  };

  const handleGuestMode = () => {
    enterGuestMode();
    router.replace('/(tabs)/library');
  };

  const isButtonDisabled = isLoading || signingIn;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          colors.brandGradientStart,
          colors.brandGradientMiddle,
          colors.brandGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top section: Logo and Title */}
        <View style={styles.topSection}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Ionicons name="book" size={88} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.title}>Readmigo</Text>
          <Text style={styles.subtitle}>
            Read any book. AI has your back.
          </Text>
        </View>

        {/* Bottom section: Buttons and Terms */}
        <Animated.View style={[styles.bottomSection, { opacity: contentOpacity }]}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Sign In Buttons */}
          <View style={styles.buttons}>
            {/* Apple Sign In - iOS only */}
            {Platform.OS === 'ios' && appleAuthAvailable && (
              <TouchableOpacity
                style={[styles.button, styles.solidButton]}
                onPress={handleAppleSignIn}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={styles.solidButtonText}>
                  {t('auth.continueWithApple')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Google Sign In */}
            <TouchableOpacity
              style={[styles.button, styles.solidButton]}
              onPress={handleGoogleSignIn}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#000000" />
              <Text style={styles.solidButtonText}>
                {t('auth.continueWithGoogle')}
              </Text>
            </TouchableOpacity>

            {/* Email Sign In */}
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={handleEmailSignIn}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.outlineButtonText}>
                Sign In with Email
              </Text>
            </TouchableOpacity>

            {/* Guest Mode */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>
                {t('auth.continueAsGuest')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms & Privacy */}
          <Text style={styles.terms}>
            {t('auth.termsPrefix')}{' '}
            <Text
              style={styles.termsLink}
              onPress={() => openURL(TERMS_URL)}
            >
              {t('auth.termsOfService')}
            </Text>
            {' '}{t('auth.and')}{' '}
            <Text
              style={styles.termsLink}
              onPress={() => openURL(PRIVACY_URL)}
            >
              {t('auth.privacyPolicy')}
            </Text>
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Loading Overlay */}
      {(isLoading || signingIn) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#FFFFFF" size="large" style={styles.spinner} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    ...Platform.select({
      ios: { fontFamily: 'System' },
    }),
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  buttons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
    gap: 8,
  },
  solidButton: {
    backgroundColor: '#FFFFFF',
  },
  solidButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  guestButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  termsLink: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
});
