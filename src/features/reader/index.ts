// Components
export { EPUBReader } from './components/EPUBReader';
export { ReaderControls } from './components/ReaderControls';
export { BookmarkPanel } from './components/BookmarkPanel';
export { HighlightToolbar } from './components/HighlightToolbar';
export { HighlightListPanel } from './components/HighlightListPanel';
export { AutoPageControl } from './components/AutoPageControl';
export { getFocusModeJS } from './components/FocusModeSelector';
export type { FocusMode } from './components/FocusModeSelector';
export type { BilingualMode } from './components/BilingualToggle';

// Hooks
export { useReadingProgress } from './hooks/useReadingProgress';

// Stores
export {
  useHighlightStore,
  HIGHLIGHT_COLORS,
} from './stores/highlightStore';
export type {
  Bookmark,
  Highlight,
  HighlightColor,
  HighlightStyle,
} from './stores/highlightStore';

// Services
export { ttsService } from './services/ttsService';
