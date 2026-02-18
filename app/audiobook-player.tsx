import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useAudioPlayerStore, formatTime, formatDuration } from '@/features/audiobook/stores/audioPlayerStore';
import { PLAYBACK_SPEEDS, SLEEP_TIMER_OPTIONS } from '@/features/audiobook/types';
import type { PlaybackSpeed, SleepTimerOption } from '@/features/audiobook/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = SCREEN_WIDTH * 0.65;

export default function AudiobookPlayerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [chapterSheetIndex, setChapterSheetIndex] = useState(-1);
  const [speedSheetIndex, setSpeedSheetIndex] = useState(-1);
  const [sleepSheetIndex, setSleepSheetIndex] = useState(-1);

  const {
    audiobook,
    currentChapter,
    chapterIndex,
    isPlaying,
    isLoading,
    isBuffering,
    currentTime,
    duration,
    playbackSpeed,
    sleepTimer,
    togglePlay,
    seek,
    seekForward,
    seekBackward,
    nextChapter,
    previousChapter,
    goToChapter,
    setPlaybackSpeed,
    setSleepTimer,
    minimize,
  } = useAudioPlayerStore();

  const chapterSnapPoints = useMemo(() => ['60%'], []);
  const sheetSnapPoints = useMemo(() => ['40%'], []);

  const handleClose = useCallback(() => {
    minimize();
    router.back();
  }, [minimize]);

  const handleSliderComplete = useCallback(
    (value: number) => {
      seek(value * duration);
    },
    [seek, duration],
  );

  const handleGoToChapter = useCallback(
    (index: number) => {
      goToChapter(index);
      setChapterSheetIndex(-1);
    },
    [goToChapter],
  );

  const handleSetSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setPlaybackSpeed(speed);
      setSpeedSheetIndex(-1);
    },
    [setPlaybackSpeed],
  );

  const handleSetSleepTimer = useCallback(
    (option: SleepTimerOption | null) => {
      setSleepTimer(option);
      setSleepSheetIndex(-1);
    },
    [setSleepTimer],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  if (!audiobook) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const isFirstChapter = chapterIndex === 0;
  const isLastChapter = chapterIndex >= audiobook.chapters.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerChapter, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentChapter?.title ||
              t('audiobook.chapterN', {
                n: chapterIndex + 1,
                defaultValue: `Chapter ${chapterIndex + 1}`,
              })}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        {audiobook.coverUrl ? (
          <Image
            source={{ uri: audiobook.coverUrl }}
            style={[styles.cover, styles.coverShadow]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="headset" size={80} color={colors.textTertiary} />
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {audiobook.author}
        </Text>
        {audiobook.narrator && (
          <Text style={[styles.bookNarrator, { color: colors.textTertiary }]} numberOfLines={1}>
            {t('audiobook.narratedBy', {
              name: audiobook.narrator,
              defaultValue: `Narrated by ${audiobook.narrator}`,
            })}
          </Text>
        )}
      </View>

      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.skipButton, isFirstChapter && styles.buttonDisabled]}
          onPress={previousChapter}
          disabled={isFirstChapter}
        >
          <Ionicons
            name="play-skip-back"
            size={28}
            color={isFirstChapter ? colors.textTertiary : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.seekButton} onPress={() => seekBackward(15)}>
          <Ionicons name="play-back" size={28} color={colors.text} />
          <Text style={[styles.seekLabel, { color: colors.textSecondary }]}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={togglePlay}
          disabled={isLoading}
        >
          {isLoading || isBuffering ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color={colors.onPrimary}
              style={!isPlaying ? { marginLeft: 4 } : undefined}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.seekButton} onPress={() => seekForward(15)}>
          <Ionicons name="play-forward" size={28} color={colors.text} />
          <Text style={[styles.seekLabel, { color: colors.textSecondary }]}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, isLastChapter && styles.buttonDisabled]}
          onPress={nextChapter}
          disabled={isLastChapter}
        >
          <Ionicons
            name="play-skip-forward"
            size={28}
            color={isLastChapter ? colors.textTertiary : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Toolbar */}
      <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setChapterSheetIndex(0)}
        >
          <Ionicons name="list" size={22} color={colors.text} />
          <Text style={[styles.toolbarLabel, { color: colors.textSecondary }]}>
            {t('audiobook.chapters', { defaultValue: 'Chapters' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setSpeedSheetIndex(0)}
        >
          <Text style={[styles.speedDisplay, { color: colors.text }]}>
            {playbackSpeed}x
          </Text>
          <Text style={[styles.toolbarLabel, { color: colors.textSecondary }]}>
            {t('audiobook.speed', { defaultValue: 'Speed' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setSleepSheetIndex(0)}
        >
          <Ionicons
            name="moon"
            size={22}
            color={sleepTimer ? colors.primary : colors.text}
          />
          <Text style={[styles.toolbarLabel, { color: colors.textSecondary }]}>
            {sleepTimer
              ? sleepTimer === 'end_of_chapter'
                ? t('audiobook.endOfChapter', { defaultValue: 'Chapter' })
                : `${sleepTimer}m`
              : t('audiobook.sleepTimer', { defaultValue: 'Sleep' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chapter List Bottom Sheet */}
      <BottomSheet
        index={chapterSheetIndex}
        snapPoints={chapterSnapPoints}
        onChange={setChapterSheetIndex}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <Text style={[styles.sheetTitle, { color: colors.text }]}>
          {t('audiobook.chapters', { defaultValue: 'Chapters' })}
        </Text>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {audiobook.chapters.map((chapter, index) => {
            const isActive = index === chapterIndex;
            return (
              <TouchableOpacity
                key={chapter.id}
                style={[
                  styles.chapterItem,
                  { borderBottomColor: colors.borderLight },
                  isActive && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => handleGoToChapter(index)}
              >
                <View style={styles.chapterItemLeft}>
                  <Text
                    style={[
                      styles.chapterNumber,
                      { color: isActive ? colors.primary : colors.textTertiary },
                    ]}
                  >
                    {chapter.number}
                  </Text>
                  <View style={styles.chapterMeta}>
                    <Text
                      style={[
                        styles.chapterTitle,
                        { color: isActive ? colors.primary : colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {chapter.title}
                    </Text>
                    <Text style={[styles.chapterDuration, { color: colors.textTertiary }]}>
                      {formatDuration(chapter.duration)}
                    </Text>
                  </View>
                </View>
                {isActive && (
                  <Ionicons name="volume-high" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Speed Picker Bottom Sheet */}
      <BottomSheet
        index={speedSheetIndex}
        snapPoints={sheetSnapPoints}
        onChange={setSpeedSheetIndex}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <Text style={[styles.sheetTitle, { color: colors.text }]}>
          {t('audiobook.playbackSpeed', { defaultValue: 'Playback Speed' })}
        </Text>
        <View style={styles.speedGrid}>
          {PLAYBACK_SPEEDS.map((speed) => {
            const isActive = playbackSpeed === speed;
            return (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => handleSetSpeed(speed)}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    { color: isActive ? colors.onPrimary : colors.text },
                  ]}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>

      {/* Sleep Timer Bottom Sheet */}
      <BottomSheet
        index={sleepSheetIndex}
        snapPoints={chapterSnapPoints}
        onChange={setSleepSheetIndex}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <Text style={[styles.sheetTitle, { color: colors.text }]}>
          {t('audiobook.sleepTimer', { defaultValue: 'Sleep Timer' })}
        </Text>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {sleepTimer && (
            <TouchableOpacity
              style={[styles.timerItem, { borderBottomColor: colors.borderLight }]}
              onPress={() => handleSetSleepTimer(null)}
            >
              <Text style={[styles.timerItemText, { color: colors.error }]}>
                {t('audiobook.turnOff', { defaultValue: 'Turn Off' })}
              </Text>
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
          {SLEEP_TIMER_OPTIONS.map((option) => {
            const isActive = sleepTimer === option.value;
            return (
              <TouchableOpacity
                key={String(option.value)}
                style={[styles.timerItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => handleSetSleepTimer(option.value)}
              >
                <Text style={[styles.timerItemText, { color: colors.text }]}>
                  {option.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerChapter: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 44,
  },

  // Cover
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
  },
  coverShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 16,
    marginTop: 4,
  },
  bookNarrator: {
    fontSize: 13,
    marginTop: 2,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  skipButton: {
    padding: 8,
  },
  seekButton: {
    alignItems: 'center',
    padding: 8,
  },
  seekLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 56,
    paddingTop: 8,
  },
  toolbarButton: {
    alignItems: 'center',
    gap: 4,
  },
  toolbarLabel: {
    fontSize: 11,
  },
  speedDisplay: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Bottom Sheet shared
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingBottom: 16,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Chapter list
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: 14,
    width: 32,
    fontWeight: '500',
  },
  chapterMeta: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  chapterDuration: {
    fontSize: 12,
    marginTop: 2,
  },

  // Speed picker
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  speedChip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
  },
  speedChipText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Sleep timer
  timerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timerItemText: {
    fontSize: 16,
  },
});
