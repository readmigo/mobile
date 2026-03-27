import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { apiClient } from '@/services/api/client';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = email.includes('@');

  const handleReset = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', { email: email.trim() });
      setSent(true);
    } catch {
      Alert.alert(
        t('auth.error', { defaultValue: 'Error' }),
        t('auth.resetFailed', { defaultValue: 'Failed to send reset email. Please try again.' }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('auth.resetPassword', { defaultValue: 'Reset Password' })}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {sent ? (
            <View style={styles.sentContainer}>
              <Ionicons name="mail-outline" size={56} color={colors.primary} />
              <Text style={[styles.sentTitle, { color: colors.text }]}>
                {t('auth.checkEmail', { defaultValue: 'Check Your Email' })}
              </Text>
              <Text style={[styles.sentBody, { color: colors.textSecondary }]}>
                {t('auth.resetEmailSent', { defaultValue: 'We sent a password reset link to' })} {email}
              </Text>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.backBtnText, { color: colors.onPrimary }]}>
                  {t('auth.backToLogin', { defaultValue: 'Back to Sign In' })}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {t('auth.resetDescription', { defaultValue: 'Enter your email address and we\'ll send you a link to reset your password.' })}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {t('auth.email', { defaultValue: 'Email' })}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.resetBtn, { backgroundColor: isValid ? colors.primary : colors.primary + '40' }]}
                onPress={handleReset}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.resetText, { color: colors.onPrimary }]}>
                    {t('auth.sendResetLink', { defaultValue: 'Send Reset Link' })}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  fieldGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  resetBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resetText: { fontSize: 16, fontWeight: '600' },
  sentContainer: { alignItems: 'center', paddingTop: 40 },
  sentTitle: { fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  sentBody: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  backBtnText: { fontSize: 16, fontWeight: '600' },
});
