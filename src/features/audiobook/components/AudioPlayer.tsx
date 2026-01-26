import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayerStore, formatTime, formatDuration } from '../stores/audioPlayerStore';
import { PLAYBACK_SPEEDS, SLEEP_TIMER_OPTIONS, PlaybackSpeed, SleepTimerOption } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AudioPlayerProps {
  onClose?: () => void;
}

export function AudioPlayer({ onClose }: AudioPlayerProps) {
  const insets = useSafeAreaInsets();
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);

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
    sleepTimerEndTime,
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

  if (!audiobook) {
    return null;
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const remainingTime = duration - currentTime;

  const handleClose = () => {
    minimize();
    onClose?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {audiobook.title}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        {audiobook.coverUrl ? (
          <Image source={{ uri: audiobook.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="headset" size={80} color="#666" />
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={styles.author}>{audiobook.author}</Text>
        {audiobook.narrator && (
          <Text style={styles.narrator}>Narrated by {audiobook.narrator}</Text>
        )}
        <Text style={styles.chapter}>
          Chapter {chapterIndex + 1} of {audiobook.chapters.length}
          {currentChapter?.title && ` • ${currentChapter.title}`}
        </Text>
      </View>

      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onSlidingComplete={(value) => seek(value * duration)}
          minimumTrackTintColor="#4f46e5"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor="#4f46e5"
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>-{formatTime(remainingTime)}</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={previousChapter}
        >
          <Ionicons name="play-skip-back" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.seekButton}
          onPress={() => seekBackward(15)}
        >
          <Ionicons name="play-back" size={28} color="#fff" />
          <Text style={styles.seekText}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlay}
          disabled={isLoading}
        >
          {isLoading || isBuffering ? (
            <Ionicons name="hourglass" size={40} color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.seekButton}
          onPress={() => seekForward(15)}
        >
          <Ionicons name="play-forward" size={28} color="#fff" />
          <Text style={styles.seekText}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={nextChapter}
        >
          <Ionicons name="play-skip-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowSpeedPicker(true)}
        >
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
          <Text style={styles.secondaryLabel}>Speed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowSleepTimer(true)}
        >
          <Ionicons
            name="moon"
            size={24}
            color={sleepTimer ? '#4f46e5' : '#fff'}
          />
          <Text style={styles.secondaryLabel}>
            {sleepTimer ? (sleepTimer === 'end_of_chapter' ? 'Chapter' : `${sleepTimer}m`) : 'Sleep'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowChapterList(true)}
        >
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={styles.secondaryLabel}>Chapters</Text>
        </TouchableOpacity>
      </View>

      {/* Speed Picker Modal */}
      <Modal
        visible={showSpeedPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSpeedPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedPicker(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Playback Speed</Text>
            <View style={styles.speedOptions}>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedOption,
                    playbackSpeed === speed && styles.speedOptionActive,
                  ]}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      playbackSpeed === speed && styles.speedOptionTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepTimer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSleepTimer(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSleepTimer(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            {sleepTimer && (
              <TouchableOpacity
                style={styles.timerOption}
                onPress={() => {
                  setSleepTimer(null);
                  setShowSleepTimer(false);
                }}
              >
                <Text style={styles.timerOptionText}>Turn Off</Text>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            )}
            {SLEEP_TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={String(option.value)}
                style={styles.timerOption}
                onPress={() => {
                  setSleepTimer(option.value);
                  setShowSleepTimer(false);
                }}
              >
                <Text style={styles.timerOptionText}>{option.label}</Text>
                {sleepTimer === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chapter List Modal */}
      <Modal
        visible={showChapterList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChapterList(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChapterList(false)}
        >
          <View style={[styles.chapterModalContent, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Chapters</Text>
            <ScrollView style={styles.chapterList}>
              {audiobook.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={chapter.id}
                  style={[
                    styles.chapterItem,
                    index === chapterIndex && styles.chapterItemActive,
                  ]}
                  onPress={() => {
                    goToChapter(index);
                    setShowChapterList(false);
                  }}
                >
                  <View style={styles.chapterInfo}>
                    <Text
                      style={[
                        styles.chapterNumber,
                        index === chapterIndex && styles.chapterTextActive,
                      ]}
                    >
                      {chapter.number}
                    </Text>
                    <View style={styles.chapterDetails}>
                      <Text
                        style={[
                          styles.chapterTitle,
                          index === chapterIndex && styles.chapterTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {chapter.title}
                      </Text>
                      <Text style={styles.chapterDuration}>
                        {formatDuration(chapter.duration)}
                      </Text>
                    </View>
                  </View>
                  {index === chapterIndex && (
                    <Ionicons name="volume-high" size={20} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cover: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: 12,
  },
  coverPlaceholder: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  author: {
    color: '#999',
    fontSize: 16,
    marginTop: 4,
  },
  narrator: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  chapter: {
    color: '#4f46e5',
    fontSize: 14,
    marginTop: 8,
  },
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
    color: '#666',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 24,
  },
  skipButton: {
    padding: 8,
  },
  seekButton: {
    alignItems: 'center',
    padding: 8,
  },
  seekText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    paddingVertical: 16,
  },
  secondaryButton: {
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  speedOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  speedOptionActive: {
    backgroundColor: '#4f46e5',
  },
  speedOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  speedOptionTextActive: {
    fontWeight: '700',
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  chapterModalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  chapterList: {
    flex: 1,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chapterItemActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  chapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterNumber: {
    color: '#666',
    fontSize: 14,
    width: 32,
  },
  chapterDetails: {
    flex: 1,
  },
  chapterTitle: {
    color: '#fff',
    fontSize: 15,
  },
  chapterDuration: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  chapterTextActive: {
    color: '#4f46e5',
  },
});
