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
import { useAuth } from '@/hooks/useAuth';

export default function EmailLoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = email.includes('@') && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)/bookshelf' as any);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.loginFailed', { defaultValue: 'Login failed. Please try again.' });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('auth.emailLogin', { defaultValue: 'Sign In with Email' })}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {/* Email */}
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

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.password', { defaultValue: 'Password' })}
            </Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              {t('auth.forgotPassword', { defaultValue: 'Forgot Password?' })}
            </Text>
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: isValid ? colors.primary : colors.primary + '40' }]}
            onPress={handleLogin}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={[styles.loginText, { color: colors.onPrimary }]}>
                {t('auth.signIn', { defaultValue: 'Sign In' })}
              </Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerLabel, { color: colors.textSecondary }]}>
              {t('auth.noAccount', { defaultValue: "Don't have an account?" })}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/email-register' as any)}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                {t('auth.signUp', { defaultValue: 'Sign Up' })}
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14 },
  passwordInput: { flex: 1, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '500' },
  error: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  loginBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  loginText: { fontSize: 16, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  registerLabel: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});
