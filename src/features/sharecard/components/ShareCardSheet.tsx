import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { ShareCardContent, ShareCardThemeId } from '../types';
import { SHARE_CARD_THEMES } from '../theme';
import { ShareCardBody } from './ShareCardBody';
import { ShareCardThemePicker } from './ShareCardThemePicker';

interface ShareCardSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  content: ShareCardContent | null;
  onClose?: () => void;
}

export function ShareCardSheet({ sheetRef, content, onClose }: ShareCardSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [themeId, setThemeId] = useState<ShareCardThemeId>('light');

  const snapPoints = useMemo(() => ['85%'], []);
  const cardTheme = SHARE_CARD_THEMES[themeId];

  const handleShareText = useCallback(async () => {
    if (!content) return;
    const lines: string[] = [`“${content.text}”`];
    if (content.bookTitle) {
      lines.push(`— ${content.bookTitle}${content.author ? ` / ${content.author}` : ''}`);
    } else if (content.author) {
      lines.push(`— ${content.author}`);
    }
    lines.push('Readmigo');
    const message = lines.join('\n\n');

    try {
      await Share.share({
        message,
        title: content.bookTitle ?? 'Readmigo',
      });
    } catch {
      // User cancelled or share failed; intentionally swallow.
    }
  }, [content]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('share.card.title', { defaultValue: 'Share Card' })}
          </Text>
        </View>

        {content && (
          <>
            <View style={styles.preview}>
              <View style={styles.cardWrap}>
                <ShareCardBody content={content} theme={cardTheme} />
              </View>
            </View>

            <View style={styles.themePickerWrap}>
              <ShareCardThemePicker selected={themeId} onSelect={setThemeId} />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionPrimary, { backgroundColor: colors.primary }]}
                onPress={handleShareText}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={18} color={colors.onPrimary} />
                <Text style={[styles.actionPrimaryText, { color: colors.onPrimary }]}>
                  {Platform.OS === 'ios'
                    ? t('share.card.share', { defaultValue: 'Share' })
                    : t('share.card.share', { defaultValue: 'Share' })}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  themePickerWrap: {
    marginVertical: 8,
  },
  actions: {
    marginTop: 16,
  },
  actionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
