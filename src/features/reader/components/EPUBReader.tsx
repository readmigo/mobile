import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';

export interface EPUBReaderProps {
  bookUrl: string;
  initialCfi?: string;
  onTextSelect?: (text: string, cfi: string) => void;
  onLocationChange?: (cfi: string, progress: number, currentPage: number, totalPages: number) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
}

interface ReaderMessage {
  type: 'ready' | 'textSelected' | 'locationChanged' | 'error' | 'tocLoaded';
  data?: any;
}

export function EPUBReader({
  bookUrl,
  initialCfi,
  onTextSelect,
  onLocationChange,
  onReady,
  onError,
}: EPUBReaderProps) {
  const { colors } = useTheme();
  const { fontSize, readerTheme, lineSpacing } = useSettingsStore();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const readerColors = {
    light: { background: '#FFFFFF', text: '#1A1A1A' },
    dark: { background: '#1A1A1A', text: '#E5E5E5' },
    sepia: { background: '#F4ECD8', text: '#5C4B37' },
  };

  const currentTheme = readerColors[readerTheme];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: ${currentTheme.background};
    }
    #reader {
      width: 100%;
      height: 100%;
    }
    ::selection {
      background: rgba(66, 133, 244, 0.3);
    }
  </style>
</head>
<body>
  <div id="reader"></div>
  <script>
    (function() {
      let book = null;
      let rendition = null;
      let currentCfi = null;

      function sendMessage(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
      }

      function initReader(url, initialCfi) {
        try {
          book = ePub(url);

          rendition = book.renderTo("reader", {
            width: "100%",
            height: "100%",
            spread: "none",
            flow: "paginated"
          });

          // Apply initial styles
          applyStyles();

          // Display the book
          const displayPromise = initialCfi
            ? rendition.display(initialCfi)
            : rendition.display();

          displayPromise.then(() => {
            sendMessage('ready');
          });

          // Handle text selection
          rendition.on('selected', (cfiRange, contents) => {
            const selection = contents.window.getSelection();
            const text = selection.toString().trim();
            if (text) {
              sendMessage('textSelected', { text, cfi: cfiRange });
            }
          });

          // Handle location changes
          rendition.on('relocated', (location) => {
            currentCfi = location.start.cfi;
            const progress = book.locations.percentageFromCfi(location.start.cfi) || 0;
            const currentPage = location.start.displayed?.page || 1;
            const totalPages = location.start.displayed?.total || 1;
            sendMessage('locationChanged', {
              cfi: currentCfi,
              progress: progress * 100,
              currentPage,
              totalPages
            });
          });

          // Generate locations for progress
          book.ready.then(() => {
            return book.locations.generate(1024);
          }).then(() => {
            // TOC loaded
            const toc = book.navigation.toc;
            sendMessage('tocLoaded', { toc });
          });

        } catch (error) {
          sendMessage('error', { message: error.message });
        }
      }

      function applyStyles() {
        if (!rendition) return;

        rendition.themes.default({
          body: {
            background: '${currentTheme.background}',
            color: '${currentTheme.text}',
            'font-size': '${fontSize}px',
            'line-height': '${lineSpacing}',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '0 16px'
          },
          'p, div, span': {
            color: '${currentTheme.text} !important',
            background: 'transparent !important'
          },
          'a': {
            color: '#4285F4'
          }
        });
      }

      function goToNext() {
        if (rendition) rendition.next();
      }

      function goToPrev() {
        if (rendition) rendition.prev();
      }

      function goToCfi(cfi) {
        if (rendition) rendition.display(cfi);
      }

      function updateStyles(options) {
        if (!rendition) return;

        const { fontSize: newFontSize, lineSpacing: newLineSpacing, theme } = options;
        const themeColors = {
          light: { background: '#FFFFFF', text: '#1A1A1A' },
          dark: { background: '#1A1A1A', text: '#E5E5E5' },
          sepia: { background: '#F4ECD8', text: '#5C4B37' },
        };

        const colors = themeColors[theme] || themeColors.light;

        rendition.themes.default({
          body: {
            background: colors.background,
            color: colors.text,
            'font-size': newFontSize + 'px',
            'line-height': newLineSpacing.toString()
          },
          'p, div, span': {
            color: colors.text + ' !important',
            background: 'transparent !important'
          }
        });

        document.body.style.background = colors.background;
      }

      // Handle messages from React Native
      window.handleMessage = function(message) {
        const { action, payload } = JSON.parse(message);
        switch (action) {
          case 'init':
            initReader(payload.url, payload.cfi);
            break;
          case 'next':
            goToNext();
            break;
          case 'prev':
            goToPrev();
            break;
          case 'goTo':
            goToCfi(payload.cfi);
            break;
          case 'updateStyles':
            updateStyles(payload);
            break;
        }
      };

      // Initialize when the page loads
      document.addEventListener('DOMContentLoaded', () => {
        // Wait for init message from React Native
      });
    })();
  </script>
</body>
</html>
`;

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message: ReaderMessage = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          setIsLoading(false);
          onReady?.();
          break;
        case 'textSelected':
          onTextSelect?.(message.data.text, message.data.cfi);
          break;
        case 'locationChanged':
          onLocationChange?.(
            message.data.cfi,
            message.data.progress,
            message.data.currentPage,
            message.data.totalPages
          );
          break;
        case 'error':
          onError?.(message.data.message);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  }, [onReady, onTextSelect, onLocationChange, onError]);

  const sendCommand = useCallback((action: string, payload?: any) => {
    const message = JSON.stringify({ action, payload });
    webViewRef.current?.injectJavaScript(`window.handleMessage('${message}'); true;`);
  }, []);

  // Initialize the reader when WebView is ready
  const handleLoad = useCallback(() => {
    sendCommand('init', { url: bookUrl, cfi: initialCfi });
  }, [bookUrl, initialCfi, sendCommand]);

  // Update styles when settings change
  useEffect(() => {
    if (!isLoading) {
      sendCommand('updateStyles', { fontSize, lineSpacing, theme: readerTheme });
    }
  }, [fontSize, lineSpacing, readerTheme, isLoading, sendCommand]);

  // Expose navigation methods
  const goToNext = useCallback(() => sendCommand('next'), [sendCommand]);
  const goToPrev = useCallback(() => sendCommand('prev'), [sendCommand]);
  const goToCfi = useCallback((cfi: string) => sendCommand('goTo', { cfi }), [sendCommand]);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoad={handleLoad}
        onMessage={handleMessage}
        originWhitelist={['*']}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
