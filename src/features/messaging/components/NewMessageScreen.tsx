import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { messagingApi } from '@/services/api/messaging';
import { FeedbackCategory, FEEDBACK_CATEGORIES } from '../types';
import { MessageTypePicker } from './MessageTypePicker';

const SUBJECT_MAX = 80;
const CONTENT_MAX = 2000;

export function NewMessageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<FeedbackCategory>('OTHER');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: createConversation, isPending } = useMutation({
    mutationFn: async () => {
      const categoryMeta = FEEDBACK_CATEGORIES.find((c) => c.id === category);
      const categoryLabel = categoryMeta ? t(categoryMeta.labelKey) : '';
      const finalSubject = subject.trim()
        ? `[${categoryLabel}] ${subject.trim()}`
        : `[${categoryLabel}]`;
      const res = await messagingApi.createConversation(
        finalSubject,
        content.trim()
      );
      return res.data;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: ['messaging', 'conversations'],
      });
      router.replace({
        pathname: '/chat' as any,
        params: { conversationId: conversation.id },
      });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        t('messaging.error.sendFailed', {
          defaultValue: 'Failed to send message',
        });
      setError(msg);
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      setError(
        t('messaging.error.contentRequired', {
          defaultValue: 'Please describe your issue',
        })
      );
      return;
    }
    setError(null);
    createConversation();
  };

  const isValid = content.trim().length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('messaging.newMessage', { defaultValue: 'New Message' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} disabled={isPending}>
              <Text style={[styles.headerAction, { color: colors.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || isPending}
              style={!isValid || isPending ? styles.headerActionDisabled : undefined}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={[
                    styles.headerAction,
                    styles.headerActionBold,
                    { color: colors.primary },
                  ]}
                >
                  {t('common.send', { defaultValue: 'Send' })}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t('messaging.category.title', { defaultValue: 'Category' })}
          </Text>
          <MessageTypePicker selected={category} onSelect={setCategory} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t('messaging.subject', { defaultValue: 'Subject (optional)' })}
          </Text>
          <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('messaging.subjectPlaceholder', {
                defaultValue: 'Brief summary',
              })}
              placeholderTextColor={colors.textTertiary}
              maxLength={SUBJECT_MAX}
              editable={!isPending}
            />
          </View>

          <View style={styles.contentHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {t('messaging.content', { defaultValue: 'Description' })}
            </Text>
            <Text style={[styles.charCounter, { color: colors.textTertiary }]}>
              {`${content.length}/${CONTENT_MAX}`}
            </Text>
          </View>
          <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[
                styles.input,
                styles.contentInput,
                { color: colors.text },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder={t('messaging.contentPlaceholder', {
                defaultValue: 'Describe what you experienced or your suggestion',
              })}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={CONTENT_MAX}
              editable={!isPending}
            />
          </View>

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  headerAction: {
    paddingHorizontal: 8,
    fontSize: 15,
  },
  headerActionBold: {
    fontWeight: '600',
  },
  headerActionDisabled: {
    opacity: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  inputCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  input: {
    fontSize: 15,
    paddingVertical: 10,
  },
  contentInput: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  charCounter: {
    fontSize: 11,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
