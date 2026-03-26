import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ttsService } from '@/features/reader/services/ttsService';
import { CloudVoice } from '@/services/api/tts';

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onSelectVoice: (voice: CloudVoice) => void;
  onClose: () => void;
}

export function VoiceSelector({ selectedVoiceId, onSelectVoice, onClose }: VoiceSelectorProps) {
  const { colors } = useTheme();
  const [voices, setVoices] = useState<CloudVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ttsService.loadVoices().then((v) => {
      setVoices(v);
      setIsLoading(false);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Select Voice</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
      ) : (
        <FlatList
          data={voices}
          keyExtractor={(item) => item.voiceId}
          renderItem={({ item }) => {
            const isSelected = item.voiceId === selectedVoiceId;
            return (
              <TouchableOpacity
                style={[
                  styles.voiceItem,
                  {
                    backgroundColor: isSelected ? colors.primary + '1A' : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => onSelectVoice(item)}
                disabled={!item.available}
              >
                <View style={styles.voiceInfo}>
                  <View style={styles.voiceNameRow}>
                    <Text style={[styles.voiceName, { color: item.available ? colors.text : colors.textSecondary }]}>
                      {item.displayName}
                    </Text>
                    {item.quality === 'premium' && (
                      <View style={[styles.premiumBadge, { backgroundColor: colors.primary + '1A' }]}>
                        <Text style={[styles.premiumText, { color: colors.primary }]}>Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.voiceMeta, { color: colors.textSecondary }]}>
                    {item.gender} · {item.accent}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
  },
  title: { fontSize: 18, fontWeight: '700' },
  listContent: { padding: 8 },
  voiceItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, marginHorizontal: 8, marginVertical: 4, borderRadius: 12, borderWidth: 1,
  },
  voiceInfo: { flex: 1 },
  voiceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voiceName: { fontSize: 15, fontWeight: '600' },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  premiumText: { fontSize: 11, fontWeight: '600' },
  voiceMeta: { fontSize: 13, marginTop: 2 },
});
