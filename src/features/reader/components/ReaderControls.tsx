import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';

interface ReaderControlsProps {
  visible: boolean;
  onClose: () => void;
}

export function ReaderControls({ visible, onClose }: ReaderControlsProps) {
  const { colors } = useTheme();
  const { fontSize, readerTheme, lineSpacing, setReaderSettings } = useSettingsStore();

  const readerColors = {
    light: { background: '#FFFFFF', text: '#1A1A1A' },
    dark: { background: '#1A1A1A', text: '#E5E5E5' },
    sepia: { background: '#F4ECD8', text: '#5C4B37' },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Reader Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Font Size</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.background }]}
                onPress={() => setReaderSettings({ fontSize: Math.max(12, fontSize - 2) })}
              >
                <Text style={[styles.controlText, { color: colors.text }]}>A-</Text>
              </TouchableOpacity>
              <Text style={[styles.valueText, { color: colors.text }]}>{fontSize}px</Text>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.background }]}
                onPress={() => setReaderSettings({ fontSize: Math.min(32, fontSize + 2) })}
              >
                <Text style={[styles.controlText, { color: colors.text }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Line Spacing */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Line Spacing</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.background }]}
                onPress={() => setReaderSettings({ lineSpacing: Math.max(1.2, lineSpacing - 0.2) })}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.valueText, { color: colors.text }]}>{lineSpacing.toFixed(1)}</Text>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: colors.background }]}
                onPress={() => setReaderSettings({ lineSpacing: Math.min(2.5, lineSpacing + 0.2) })}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeRow}>
              {(['light', 'dark', 'sepia'] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: readerColors[theme].background },
                    readerTheme === theme && { borderWidth: 3, borderColor: colors.primary },
                  ]}
                  onPress={() => setReaderSettings({ readerTheme: theme })}
                >
                  <Text style={{ color: readerColors[theme].text, fontSize: 12, fontWeight: '600' }}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
