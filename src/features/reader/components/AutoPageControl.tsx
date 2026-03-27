import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface AutoPageControlProps {
  visible: boolean;
  onPageNext: () => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '15s', value: 15000 },
  { label: '20s', value: 20000 },
  { label: '30s', value: 30000 },
];

export function AutoPageControl({ visible, onPageNext, onClose }: AutoPageControlProps) {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(2); // default 15s
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speed = SPEED_OPTIONS[speedIndex].value;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      onPageNext();
    }, speed);
  }, [speed, onPageNext, stop]);

  // Restart interval when speed changes during playback
  useEffect(() => {
    if (isPlaying) {
      start();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed]);

  // Cleanup on unmount
  useEffect(() => {
    return stop;
  }, [stop]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Play/Pause */}
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: colors.primary }]}
        onPress={isPlaying ? stop : start}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={colors.onPrimary}
        />
      </TouchableOpacity>

      {/* Speed selector */}
      <View style={styles.speedRow}>
        {SPEED_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.speedChip,
              { backgroundColor: i === speedIndex ? colors.primary + '20' : 'transparent' },
            ]}
            onPress={() => setSpeedIndex(i)}
          >
            <Text
              style={[
                styles.speedText,
                { color: i === speedIndex ? colors.primary : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Close */}
      <TouchableOpacity onPress={() => { stop(); onClose(); }}>
        <Ionicons name="close" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    gap: 10,
    zIndex: 15,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedRow: { flex: 1, flexDirection: 'row', gap: 4 },
  speedChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  speedText: { fontSize: 12, fontWeight: '600' },
});
