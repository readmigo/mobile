import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ttsApi, TimestampSegment, ChapterTimestamps } from '@/services/api/tts';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';

interface FollowAlongViewProps {
  audiobookId: string;
  chapterNumber: number;
  chapterText: string;
}

export function FollowAlongView({
  audiobookId,
  chapterNumber,
  chapterText,
}: FollowAlongViewProps) {
  const { colors } = useTheme();
  const currentTime = useAudioPlayerStore((s) => s.currentTime);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);

  const [timestamps, setTimestamps] = useState<ChapterTimestamps | null>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<number>(-1);
  const scrollRef = useRef<ScrollView>(null);
  const segmentPositions = useRef<Record<number, number>>({});

  // Fetch timestamps
  useEffect(() => {
    let cancelled = false;
    ttsApi.getChapterTimestamps(audiobookId, chapterNumber)
      .then((res) => {
        if (!cancelled) setTimestamps(res.data);
      })
      .catch(() => {
        // Timestamps unavailable for this chapter
      });
    return () => { cancelled = true; };
  }, [audiobookId, chapterNumber]);

  // Binary search for active segment
  const findActiveSegment = useCallback((time: number, segments: TimestampSegment[]): number => {
    if (segments.length === 0) return -1;
    let low = 0;
    let high = segments.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (time >= segments[mid].startTime && time < segments[mid].endTime) {
        return segments[mid].segmentId;
      } else if (time < segments[mid].startTime) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return -1;
  }, []);

  // Update active segment on time change
  useEffect(() => {
    if (!timestamps || !isPlaying) return;
    const newActive = findActiveSegment(currentTime, timestamps.segments);
    if (newActive !== activeSegmentId) {
      setActiveSegmentId(newActive);
      // Auto-scroll to active segment
      const yPos = segmentPositions.current[newActive];
      if (yPos !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, yPos - 100), animated: true });
      }
    }
  }, [currentTime, timestamps, isPlaying, activeSegmentId, findActiveSegment]);

  if (!timestamps) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.plainText, { color: colors.text }]}>{chapterText}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {timestamps.segments.map((segment) => {
        const isActive = segment.segmentId === activeSegmentId;
        return (
          <Text
            key={segment.segmentId}
            onLayout={(e) => {
              segmentPositions.current[segment.segmentId] = e.nativeEvent.layout.y;
            }}
            style={[
              styles.segment,
              {
                color: isActive ? colors.primary : colors.text,
                backgroundColor: isActive ? colors.primary + '1A' : 'transparent',
                fontWeight: isActive ? '600' : '400',
              },
            ]}
          >
            {segment.text}
          </Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  plainText: { fontSize: 16, lineHeight: 26 },
  segment: {
    fontSize: 16,
    lineHeight: 26,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
