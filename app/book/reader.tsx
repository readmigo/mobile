import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { EPUBReader } from '@/features/reader';
import { ReaderControls } from '@/features/reader';
import { AIExplanationPanel } from '@/features/ai';

export default function ReaderScreen() {
  const { colors } = useTheme();
  const { bookId, bookUrl } = useLocalSearchParams<{ bookId: string; bookUrl?: string }>();
  const { readerTheme } = useSettingsStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedCfi, setSelectedCfi] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const readerColors = {
    light: { background: '#FFFFFF', text: '#1A1A1A' },
    dark: { background: '#1A1A1A', text: '#E5E5E5' },
    sepia: { background: '#F4ECD8', text: '#5C4B37' },
  };

  const currentReaderTheme = readerColors[readerTheme];

  const handleTextSelect = useCallback((text: string, cfi: string) => {
    setSelectedText(text);
    setSelectedCfi(cfi);
    setShowAIPanel(true);
  }, []);

  const handleLocationChange = useCallback((cfi: string, prog: number, page: number, total: number) => {
    setProgress(prog);
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleDismissAI = () => {
    setShowAIPanel(false);
    setSelectedText(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentReaderTheme.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: currentReaderTheme.background,
            opacity: showMenu ? 1 : 0,
          },
        ]}
        pointerEvents={showMenu ? 'auto' : 'none'}
      >
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color={currentReaderTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentReaderTheme.text }]}>
          The Great Gatsby
        </Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color={currentReaderTheme.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity
        style={styles.contentContainer}
        activeOpacity={1}
        onPress={() => setShowMenu(!showMenu)}
      >
        {bookUrl ? (
          <EPUBReader
            bookUrl={bookUrl}
            onTextSelect={handleTextSelect}
            onLocationChange={handleLocationChange}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="book-outline" size={48} color={currentReaderTheme.text + '50'} />
            <Text style={[styles.placeholderText, { color: currentReaderTheme.text + '80' }]}>
              No book loaded
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: currentReaderTheme.background,
            opacity: showMenu ? 1 : 0,
          },
        ]}
        pointerEvents={showMenu ? 'auto' : 'none'}
      >
        <Text style={[styles.progressText, { color: currentReaderTheme.text }]}>
          Page {currentPage} of {totalPages} ({progress.toFixed(0)}%)
        </Text>
        <View style={[styles.progressBar, { backgroundColor: currentReaderTheme.text + '30' }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {/* Reader Settings */}
      <ReaderControls visible={showSettings} onClose={() => setShowSettings(false)} />

      {/* AI Explanation Panel */}
      {selectedText && (
        <AIExplanationPanel
          selectedText={selectedText}
          bookId={bookId}
          visible={showAIPanel}
          onDismiss={handleDismissAI}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
