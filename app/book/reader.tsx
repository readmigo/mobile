import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { EPUBReader } from '@/features/reader';
import { ReaderControls } from '@/features/reader';
import { AIExplanationPanel } from '@/features/ai';
import { BookmarkPanel } from '@/features/reader/components/BookmarkPanel';
import { HighlightToolbar } from '@/features/reader/components/HighlightToolbar';
import { HighlightListPanel } from '@/features/reader/components/HighlightListPanel';
import { AutoPageControl } from '@/features/reader/components/AutoPageControl';
import { getFocusModeJS, type FocusMode } from '@/features/reader/components/FocusModeSelector';
import type { BilingualMode } from '@/features/reader/components/BilingualToggle';
import { useHighlightStore } from '@/features/reader/stores/highlightStore';
import { useReadingProgress } from '@/features/reader/hooks/useReadingProgress';

export default function ReaderScreen() {
  const { colors } = useTheme();
  const { bookId, bookUrl, initialCfi } = useLocalSearchParams<{
    bookId: string;
    bookUrl?: string;
    initialCfi?: string;
  }>();
  const { readerTheme } = useSettingsStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [currentCfi, setCurrentCfi] = useState<string | null>(initialCfi ?? null);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<FocusMode>('off');
  const [bilingualMode, setBilingualMode] = useState<BilingualMode>('off');
  const [bilingualLocale, setBilingualLocale] = useState('zh-Hans');
  const [showAutoPage, setShowAutoPage] = useState(false);

  // Reading progress sync
  const { updateLocation, flush: flushProgress } = useReadingProgress({ bookId });

  const bookmarkSheetRef = useRef<BottomSheet>(null);
  const highlightSheetRef = useRef<BottomSheet>(null);
  const epubReaderRef = useRef<{ goToCfi: (cfi: string) => void } | null>(null);

  // Highlight toolbar state
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  const [selectedCfi, setSelectedCfi] = useState<string | null>(null);

  // Bookmark state
  const addBookmark = useHighlightStore((s) => s.addBookmark);
  const removeBookmark = useHighlightStore((s) => s.removeBookmark);
  const getBookBookmarks = useHighlightStore((s) => s.getBookBookmarks);

  const bookmarks = getBookBookmarks(bookId || '');
  const isCurrentLocationBookmarked = useMemo(
    () => currentCfi ? bookmarks.some((b) => b.cfiPath === currentCfi) : false,
    [bookmarks, currentCfi],
  );

  const readerColors = {
    light: { background: '#FFFFFF', text: '#1A1A1A' },
    dark: { background: '#1A1A1A', text: '#E5E5E5' },
    sepia: { background: '#F4ECD8', text: '#5C4B37' },
  };

  const currentReaderTheme = readerColors[readerTheme];

  const handleTextSelect = useCallback((text: string, cfi: string) => {
    setSelectedText(text);
    setSelectedCfi(cfi);
    setShowHighlightToolbar(true);
  }, []);

  const handleLocationChange = useCallback((cfi: string, prog: number, page: number, total: number) => {
    setCurrentCfi(cfi);
    setProgress(prog);
    setCurrentPage(page);
    setTotalPages(total);
    updateLocation(cfi, prog);
  }, [updateLocation]);

  const handleClose = () => {
    flushProgress();
    router.back();
  };

  const handleDismissAI = () => {
    setShowAIPanel(false);
    setSelectedText(null);
  };

  const handleDismissHighlightToolbar = () => {
    setShowHighlightToolbar(false);
    setSelectedText(null);
    setSelectedCfi(null);
  };

  const handleHighlightCreated = () => {
    setShowHighlightToolbar(false);
  };

  const handleExplainFromToolbar = () => {
    setShowHighlightToolbar(false);
    setShowAIPanel(true);
  };

  const handleTranslateFromToolbar = () => {
    setShowHighlightToolbar(false);
    setShowAIPanel(true);
  };

  const handleOpenHighlights = useCallback(() => {
    highlightSheetRef.current?.snapToIndex(0);
  }, []);

  // Focus mode: inject CSS into WebView
  const webViewRef = useRef<any>(null);
  const handleFocusModeChange = useCallback((mode: FocusMode) => {
    setFocusMode(mode);
    const js = getFocusModeJS(mode);
    webViewRef.current?.injectJavaScript?.(js);
  }, []);

  // Auto-page: send next command
  const handleAutoPageNext = useCallback(() => {
    webViewRef.current?.injectJavaScript?.(`window.handleMessage('${JSON.stringify({ action: 'next' })}'); true;`);
  }, []);

  const handleToggleBookmark = useCallback(() => {
    if (!bookId || !currentCfi) return;

    if (isCurrentLocationBookmarked) {
      const bookmark = bookmarks.find((b) => b.cfiPath === currentCfi);
      if (bookmark) {
        removeBookmark(bookId, bookmark.id);
      }
    } else {
      addBookmark({
        id: Date.now().toString(),
        bookId,
        chapterIndex: currentChapterIndex,
        paragraphIndex: 0,
        scrollPercentage: progress / 100,
        cfiPath: currentCfi,
        title: `Page ${currentPage}`,
        createdAt: new Date().toISOString(),
      });
    }
  }, [bookId, currentCfi, isCurrentLocationBookmarked, bookmarks, removeBookmark, addBookmark, currentChapterIndex, progress, currentPage]);

  const handleOpenBookmarks = useCallback(() => {
    bookmarkSheetRef.current?.snapToIndex(0);
  }, []);

  const handleNavigateToCfi = useCallback((cfi: string) => {
    epubReaderRef.current?.goToCfi(cfi);
  }, []);

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

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleBookmark} style={styles.headerBtn}>
            <Ionicons
              name={isCurrentLocationBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isCurrentLocationBookmarked ? colors.primary : currentReaderTheme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenHighlights} style={styles.headerBtn}>
            <Ionicons name="color-palette-outline" size={22} color={currentReaderTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenBookmarks} style={styles.headerBtn}>
            <Ionicons name="list-outline" size={22} color={currentReaderTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAutoPage(!showAutoPage)} style={styles.headerBtn}>
            <Ionicons name="play-forward-outline" size={22} color={showAutoPage ? colors.primary : currentReaderTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color={currentReaderTheme.text} />
          </TouchableOpacity>
        </View>
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
            initialCfi={initialCfi}
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

      {/* Auto Page Control */}
      <AutoPageControl
        visible={showAutoPage}
        onPageNext={handleAutoPageNext}
        onClose={() => setShowAutoPage(false)}
      />

      {/* Reader Settings */}
      <ReaderControls
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        focusMode={focusMode}
        onFocusModeChange={handleFocusModeChange}
        bilingualMode={bilingualMode}
        bilingualLocale={bilingualLocale}
        onBilingualModeChange={setBilingualMode}
        onBilingualLocaleChange={setBilingualLocale}
      />

      {/* AI Explanation Panel */}
      {selectedText && showAIPanel && (
        <AIExplanationPanel
          text={selectedText}
          bookId={bookId}
          onClose={handleDismissAI}
        />
      )}

      {/* Highlight Toolbar (shown on text selection) */}
      {showHighlightToolbar && selectedText && selectedCfi && bookId && (
        <HighlightToolbar
          selectedText={selectedText}
          selectedCfi={selectedCfi}
          bookId={bookId}
          chapterId={`ch-${currentChapterIndex}`}
          onHighlightCreated={handleHighlightCreated}
          onExplain={handleExplainFromToolbar}
          onTranslate={handleTranslateFromToolbar}
          onDismiss={handleDismissHighlightToolbar}
        />
      )}

      {/* Bookmark Panel */}
      {bookId && (
        <BookmarkPanel
          bookId={bookId}
          sheetRef={bookmarkSheetRef}
          onNavigateToCfi={handleNavigateToCfi}
        />
      )}

      {/* Highlight List Panel */}
      {bookId && (
        <HighlightListPanel
          bookId={bookId}
          sheetRef={highlightSheetRef}
          onNavigateToCfi={handleNavigateToCfi}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    padding: 8,
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
