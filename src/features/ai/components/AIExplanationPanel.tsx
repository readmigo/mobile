import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAIExplain, useAITranslate, useAISimplify } from '../hooks/useAIExplain';
import { useSaveVocabulary } from '../hooks/useVocabulary';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/Button';

export type AIAction = 'explain' | 'translate' | 'simplify';

interface AIExplanationPanelProps {
  selectedText: string;
  context?: string;
  bookId?: string;
  onDismiss: () => void;
  visible: boolean;
}

export function AIExplanationPanel({
  selectedText,
  context,
  bookId,
  onDismiss,
  visible,
}: AIExplanationPanelProps) {
  const { colors } = useTheme();
  const { language } = useSettingsStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);

  const snapPoints = useMemo(() => ['40%', '75%'], []);

  const { explain, isLoading: explainLoading, data: explainData } = useAIExplain();
  const { translate, isLoading: translateLoading, data: translateData } = useAITranslate();
  const { simplify, isLoading: simplifyLoading, data: simplifyData } = useAISimplify();
  const saveVocabulary = useSaveVocabulary();

  const isLoading = explainLoading || translateLoading || simplifyLoading;

  const handleAction = async (action: AIAction) => {
    setActiveAction(action);
    try {
      switch (action) {
        case 'explain':
          await explain(selectedText, context, bookId);
          break;
        case 'translate':
          await translate(selectedText, language.startsWith('zh') ? 'zh-CN' : language);
          break;
        case 'simplify':
          await simplify(selectedText);
          break;
      }
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  const handleSaveWord = async () => {
    if (!explainData) return;

    try {
      await saveVocabulary.mutateAsync({
        word: selectedText,
        definition: explainData.explanation,
        pronunciation: explainData.pronunciation,
        examples: explainData.examples,
        context,
        bookId,
      });
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

  const getCurrentResult = () => {
    switch (activeAction) {
      case 'explain':
        return explainData;
      case 'translate':
        return translateData;
      case 'simplify':
        return simplifyData;
      default:
        return null;
    }
  };

  const renderResult = () => {
    const result = getCurrentResult();
    if (!result) return null;

    if (activeAction === 'explain' && explainData) {
      return (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, { color: colors.text }]}>
            {explainData.explanation}
          </Text>

          {explainData.pronunciation && (
            <View style={styles.pronunciationContainer}>
              <Ionicons name="volume-medium" size={20} color={colors.primary} />
              <Text style={[styles.pronunciationText, { color: colors.textSecondary }]}>
                {explainData.pronunciation}
              </Text>
            </View>
          )}

          {explainData.examples && explainData.examples.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Examples</Text>
              {explainData.examples.map((example, index) => (
                <Text
                  key={index}
                  style={[styles.exampleText, { color: colors.textSecondary }]}
                >
                  • {example}
                </Text>
              ))}
            </View>
          )}

          {explainData.relatedWords && explainData.relatedWords.length > 0 && (
            <View style={styles.relatedContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Related Words</Text>
              <View style={styles.relatedWordsRow}>
                {explainData.relatedWords.map((word, index) => (
                  <View
                    key={index}
                    style={[styles.relatedWordChip, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Text style={[styles.relatedWordText, { color: colors.text }]}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            title={saveVocabulary.isPending ? 'Saving...' : 'Save to Vocabulary'}
            onPress={handleSaveWord}
            variant="primary"
            loading={saveVocabulary.isPending}
            style={styles.saveButton}
          />
        </View>
      );
    }

    if (activeAction === 'translate' && translateData) {
      return (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, { color: colors.text }]}>
            {translateData.translatedText}
          </Text>
          {translateData.detectedLanguage && (
            <Text style={[styles.detectedLanguage, { color: colors.textTertiary }]}>
              Detected: {translateData.detectedLanguage}
            </Text>
          )}
        </View>
      );
    }

    if (activeAction === 'simplify' && simplifyData) {
      return (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, { color: colors.text }]}>
            {simplifyData.simplifiedText}
          </Text>
          {simplifyData.changes && simplifyData.changes.length > 0 && (
            <View style={styles.changesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Changes Made</Text>
              {simplifyData.changes.map((change, index) => (
                <View key={index} style={styles.changeRow}>
                  <Text style={[styles.originalWord, { color: colors.error }]}>
                    {change.original}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <Text style={[styles.simplifiedWord, { color: colors.success }]}>
                    {change.simplified}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Selected Text */}
        <View style={[styles.selectedTextContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.selectedText, { color: colors.text }]} numberOfLines={3}>
            "{selectedText}"
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: activeAction === 'explain' ? colors.primary : colors.backgroundSecondary },
            ]}
            onPress={() => handleAction('explain')}
            disabled={isLoading}
          >
            <Ionicons
              name="bulb"
              size={20}
              color={activeAction === 'explain' ? colors.onPrimary : colors.text}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: activeAction === 'explain' ? colors.onPrimary : colors.text },
              ]}
            >
              Explain
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: activeAction === 'translate' ? colors.primary : colors.backgroundSecondary },
            ]}
            onPress={() => handleAction('translate')}
            disabled={isLoading}
          >
            <Ionicons
              name="language"
              size={20}
              color={activeAction === 'translate' ? colors.onPrimary : colors.text}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: activeAction === 'translate' ? colors.onPrimary : colors.text },
              ]}
            >
              Translate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: activeAction === 'simplify' ? colors.primary : colors.backgroundSecondary },
            ]}
            onPress={() => handleAction('simplify')}
            disabled={isLoading}
          >
            <Ionicons
              name="text"
              size={20}
              color={activeAction === 'simplify' ? colors.onPrimary : colors.text}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: activeAction === 'simplify' ? colors.onPrimary : colors.text },
              ]}
            >
              Simplify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {activeAction === 'explain' && 'Analyzing...'}
              {activeAction === 'translate' && 'Translating...'}
              {activeAction === 'simplify' && 'Simplifying...'}
            </Text>
          </View>
        )}

        {/* Results */}
        {!isLoading && renderResult()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  selectedTextContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  pronunciationText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  examplesContainer: {
    marginTop: 16,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  relatedContainer: {
    marginTop: 16,
  },
  relatedWordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedWordChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  relatedWordText: {
    fontSize: 14,
  },
  detectedLanguage: {
    marginTop: 8,
    fontSize: 12,
  },
  changesContainer: {
    marginTop: 16,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  originalWord: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  simplifiedWord: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 20,
  },
});
