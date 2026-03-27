import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/services/api/client';

const SUPPORTED_TYPES = ['application/epub+zip', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

interface ImportSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  onImportComplete?: () => void;
}

export function ImportSheet({ sheetRef, onImportComplete }: ImportSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ['35%'], []);
  const [isImporting, setIsImporting] = useState(false);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];

      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          t('import.fileTooLarge', { defaultValue: 'File Too Large' }),
          t('import.maxSize', { defaultValue: 'Maximum file size is 50 MB.' }),
        );
        return;
      }

      setIsImporting(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      await apiClient.post('/books/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      setIsImporting(false);
      sheetRef.current?.close();
      onImportComplete?.();

      Alert.alert(
        t('import.success', { defaultValue: 'Import Successful' }),
        t('import.bookAdded', { defaultValue: 'The book has been added to your library.' }),
      );
    } catch (error) {
      setIsImporting(false);
      Alert.alert(
        t('import.failed', { defaultValue: 'Import Failed' }),
        t('import.tryAgain', { defaultValue: 'Please try again.' }),
      );
    }
  }, [sheetRef, onImportComplete, t]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <BottomSheetView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('import.title', { defaultValue: 'Import Book' })}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('import.supportedFormats', { defaultValue: 'Supported formats: EPUB, PDF, TXT' })}
        </Text>

        <TouchableOpacity
          style={[styles.pickButton, { backgroundColor: colors.primary }]}
          onPress={handlePickFile}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="folder-open-outline" size={22} color={colors.onPrimary} />
              <Text style={[styles.pickText, { color: colors.onPrimary }]}>
                {t('import.chooseFile', { defaultValue: 'Choose File' })}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.limit, { color: colors.textTertiary }]}>
          {t('import.sizeLimit', { defaultValue: 'Max 50 MB per file' })}
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  pickText: { fontSize: 16, fontWeight: '600' },
  limit: { fontSize: 12, marginTop: 12 },
});
