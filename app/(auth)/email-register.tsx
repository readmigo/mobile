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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

export default function EmailRegisterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = displayName.trim().length >= 2 && email.includes('@') && password.length >= 6;

  const handleRegister = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);

    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/(auth)/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.registerFailed', { defaultValue: 'Registration failed.' });
      setError(msg);
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
            {t('auth.createAccount', { defaultValue: 'Create Account' })}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.displayName', { defaultValue: 'Display Name' })}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('auth.displayNamePlaceholder', { defaultValue: 'Your name' })}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

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
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.password', { defaultValue: 'Password' })}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordHint', { defaultValue: 'At least 6 characters' })}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
            />
          </View>

          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: isValid ? colors.primary : colors.primary + '40' }]}
            onPress={handleRegister}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={[styles.registerText, { color: colors.onPrimary }]}>
                {t('auth.signUp', { defaultValue: 'Sign Up' })}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={[styles.loginLabel, { color: colors.textSecondary }]}>
              {t('auth.hasAccount', { defaultValue: 'Already have an account?' })}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                {t('auth.signIn', { defaultValue: 'Sign In' })}
              </Text>
            </TouchableOpacity>
          </View>
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
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  error: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  registerBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  registerText: { fontSize: 16, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  loginLabel: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '600' },
});
