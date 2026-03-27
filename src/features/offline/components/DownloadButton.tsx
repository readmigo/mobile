import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useOfflineBook } from '../hooks/useOfflineBook';

interface DownloadButtonProps {
  bookId: string;
  bookTitle?: string;
  compact?: boolean;
}

export function DownloadButton({ bookId, bookTitle, compact }: DownloadButtonProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isDownloaded, isDownloading, download, remove } = useOfflineBook(bookId, bookTitle);

  const handlePress = () => {
    if (isDownloaded) {
      Alert.alert(
        t('offline.removeDownload', { defaultValue: 'Remove Download' }),
        t('offline.removeConfirm', { defaultValue: 'Remove this book from offline storage?' }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.delete', { defaultValue: 'Delete' }), style: 'destructive', onPress: remove },
        ],
      );
    } else if (!isDownloading) {
      download();
    }
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={handlePress} style={styles.compactBtn} hitSlop={8}>
        {isDownloading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
            size={22}
            color={isDownloaded ? colors.primary : colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: isDownloaded ? colors.primary + '15' : colors.surface,
          borderColor: isDownloaded ? colors.primary : colors.border,
        },
      ]}
      onPress={handlePress}
    >
      {isDownloading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons
          name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
          size={18}
          color={isDownloaded ? colors.primary : colors.text}
        />
      )}
      <Text style={[styles.btnText, { color: isDownloaded ? colors.primary : colors.text }]}>
        {isDownloaded
          ? t('offline.downloaded', { defaultValue: 'Downloaded' })
          : isDownloading
            ? t('offline.downloading', { defaultValue: 'Downloading...' })
            : t('offline.download', { defaultValue: 'Download' })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  btnText: { fontSize: 14, fontWeight: '500' },
  compactBtn: { padding: 4 },
});
