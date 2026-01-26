import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
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

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  // Google Auth hook
  const { response: googleResponse, promptAsync: promptGoogleAsync, isReady: googleReady } = useGoogleAuth();

  // Check Apple auth availability
  useEffect(() => {
    isAppleAuthAvailable().then(setAppleAuthAvailable);
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

  const handleGuestMode = () => {
    enterGuestMode();
    router.replace('/(tabs)/library');
  };

  const isButtonDisabled = isLoading || signingIn;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="book" size={48} color={colors.onPrimary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Readmigo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Read any book. AI has your back.
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        {/* Sign In Buttons */}
        <View style={styles.buttons}>
          {Platform.OS === 'ios' && appleAuthAvailable && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={isButtonDisabled}
            >
              {signingIn ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.googleButton, { borderColor: colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={isButtonDisabled}
          >
            {signingIn ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#4285F4" />
                <Text style={[styles.googleButtonText, { color: colors.text }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.guestButton]}
            onPress={handleGuestMode}
            disabled={isButtonDisabled}
          >
            <Text style={[styles.guestButtonText, { color: colors.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.textTertiary }]}>
          {t('auth.termsPrefix')}{' '}
          <Text
            style={{ color: colors.primary }}
            onPress={() => openURL(TERMS_URL)}
          >
            {t('auth.termsOfService')}
          </Text>
          {' '}{t('auth.and')}{' '}
          <Text
            style={{ color: colors.primary }}
            onPress={() => openURL(PRIVACY_URL)}
          >
            {t('auth.privacyPolicy')}
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    minHeight: 56,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
});
