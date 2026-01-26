import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayerStore, formatTime } from '../stores/audioPlayerStore';

interface MiniPlayerProps {
  onPress?: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const {
    audiobook,
    currentChapter,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    seekBackward,
    seekForward,
    isVisible,
    isMinimized,
  } = useAudioPlayerStore();

  if (!isVisible || !isMinimized || !audiobook) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        {audiobook.coverUrl ? (
          <Image source={{ uri: audiobook.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="headset" size={20} color="#666" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {audiobook.title}
          </Text>
          <Text style={styles.chapter} numberOfLines={1}>
            {currentChapter?.title || `Chapter ${currentChapter?.number}`}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekBackward(15)}
          >
            <Ionicons name="play-back" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={24} color="#fff" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="#fff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekForward(15)}
          >
            <Ionicons name="play-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  coverPlaceholder: {
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chapter: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  timeText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'right',
  },
});
