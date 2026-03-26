import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface ReadingStatsOverlayProps {
  visible: boolean;
  wordsRead: number;
  sessionStartTime: number;
  currentPage: number;
  totalPages: number;
  chapterProgress: number;
}

export function ReadingStatsOverlay({
  visible,
  wordsRead,
  sessionStartTime,
  currentPage,
  totalPages,
  chapterProgress,
}: ReadingStatsOverlayProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, [visible, sessionStartTime]);

  const wpm = elapsedMinutes > 0 ? Math.round(wordsRead / elapsedMinutes) : 0;
  const estimatedRemaining = wpm > 0 && totalPages > 0
    ? Math.round(((totalPages - currentPage) / totalPages) * (wordsRead / wpm))
    : 0;

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: colors.surface + 'E6' }]}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Ionicons name="speedometer-outline" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{wpm}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>WPM</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{elapsedMinutes}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>min</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Ionicons name="hourglass-outline" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{estimatedRemaining}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>min left</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Ionicons name="book-outline" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(chapterProgress)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>progress</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E0E0E0',
  },
});
