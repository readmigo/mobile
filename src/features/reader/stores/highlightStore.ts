import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
export type HighlightStyle = 'underline' | 'wavy' | 'background' | 'boldLine';

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; underline: string }> = {
  yellow: { bg: 'rgba(255, 235, 59, 0.3)', underline: '#FDD835' },
  green: { bg: 'rgba(76, 175, 80, 0.3)', underline: '#43A047' },
  blue: { bg: 'rgba(66, 133, 244, 0.3)', underline: '#4285F4' },
  pink: { bg: 'rgba(233, 30, 99, 0.3)', underline: '#E91E63' },
  purple: { bg: 'rgba(156, 39, 176, 0.3)', underline: '#9C27B0' },
  orange: { bg: 'rgba(255, 152, 0, 0.3)', underline: '#FB8C00' },
};

// Sync-aware shape. `serverId` is null until the server acknowledges. Soft-deleted records
// keep `deletedAt` set so the sync engine can propagate the tombstone; getters filter them out.
export interface Highlight {
  id: string; // local id (used as localId in sync API)
  serverId: string | null;
  bookId: string;
  chapterId: string;
  selectedText: string;
  color: HighlightColor;
  style: HighlightStyle;
  paragraphIndex: number;
  charOffset: number;
  charLength: number;
  cfiPath?: string;
  note?: string; // local-only, not synced (server stores notes as separate Annotation entities)
  createdAt: string;
  updatedAt: string;
  version: number;
  dirty: boolean;
  deletedAt: string | null;
  syncedAt?: string;
}

export interface Bookmark {
  id: string; // local id
  serverId: string | null;
  bookId: string;
  chapterId?: string; // required for server push; older local records may lack it
  chapterIndex: number;
  paragraphIndex: number;
  scrollPercentage: number;
  cfiPath?: string;
  title?: string;
  note?: string; // local-only, not synced (server BookmarkDto has no note field)
  createdAt: string;
  updatedAt: string;
  version: number;
  dirty: boolean;
  deletedAt: string | null;
  syncedAt?: string;
}

export type HighlightInput = Omit<
  Highlight,
  'serverId' | 'updatedAt' | 'version' | 'dirty' | 'deletedAt' | 'syncedAt'
>;
export type BookmarkInput = Omit<
  Bookmark,
  'serverId' | 'updatedAt' | 'version' | 'dirty' | 'deletedAt' | 'syncedAt'
>;

interface HighlightState {
  highlights: Record<string, Highlight[]>; // keyed by bookId
  bookmarks: Record<string, Bookmark[]>; // keyed by bookId
  activeColor: HighlightColor;
  activeStyle: HighlightStyle;
  lastFullPullAt: string | null;
}

interface HighlightActions {
  // Mutations from UI
  addHighlight: (highlight: HighlightInput) => void;
  removeHighlight: (bookId: string, highlightId: string) => void;
  updateHighlightNote: (bookId: string, highlightId: string, note: string) => void;
  setActiveColor: (color: HighlightColor) => void;
  setActiveStyle: (style: HighlightStyle) => void;
  addBookmark: (bookmark: BookmarkInput) => void;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
  // Filtered getters for UI
  getBookHighlights: (bookId: string) => Highlight[];
  getBookBookmarks: (bookId: string) => Bookmark[];
  // Sync engine actions
  markHighlightSynced: (localId: string, serverId: string | null, syncedAt: string) => void;
  markBookmarkSynced: (localId: string, serverId: string | null, syncedAt: string) => void;
  applyServerHighlight: (highlight: Highlight) => void;
  applyServerBookmark: (bookmark: Bookmark) => void;
  hardRemoveHighlight: (localId: string) => void;
  hardRemoveBookmark: (localId: string) => void;
  getDirtyHighlights: () => Highlight[];
  getDirtyBookmarks: () => Bookmark[];
  setLastFullPullAt: (iso: string) => void;
}

const STORAGE_VERSION = 2;

function findById<T extends { id: string }>(map: Record<string, T[]>, localId: string): T | undefined {
  for (const list of Object.values(map)) {
    const found = list.find((item) => item.id === localId);
    if (found) return found;
  }
  return undefined;
}

function flat<T>(map: Record<string, T[]>): T[] {
  const out: T[] = [];
  for (const list of Object.values(map)) out.push(...list);
  return out;
}

export const useHighlightStore = create<HighlightState & HighlightActions>()(
  persist(
    immer((set, get) => ({
      highlights: {},
      bookmarks: {},
      activeColor: 'yellow',
      activeStyle: 'background',
      lastFullPullAt: null,

      addHighlight: (input) =>
        set((state) => {
          if (!state.highlights[input.bookId]) state.highlights[input.bookId] = [];
          const now = new Date().toISOString();
          state.highlights[input.bookId].push({
            ...input,
            serverId: null,
            updatedAt: now,
            version: 1,
            dirty: true,
            deletedAt: null,
          });
        }),

      removeHighlight: (bookId, highlightId) =>
        set((state) => {
          const h = state.highlights[bookId]?.find((h) => h.id === highlightId);
          if (h && !h.deletedAt) {
            h.deletedAt = new Date().toISOString();
            h.updatedAt = h.deletedAt;
            h.version += 1;
            h.dirty = true;
          }
        }),

      updateHighlightNote: (bookId, highlightId, note) =>
        set((state) => {
          const h = state.highlights[bookId]?.find((h) => h.id === highlightId);
          if (h && !h.deletedAt) {
            h.note = note;
            h.updatedAt = new Date().toISOString();
            h.version += 1;
            // Note: local-only, but we still mark dirty so updatedAt-driven LWW
            // doesn't get clobbered on next pull. Engine ignores note diff on push.
            h.dirty = true;
          }
        }),

      setActiveColor: (color) => set((state) => { state.activeColor = color; }),
      setActiveStyle: (style) => set((state) => { state.activeStyle = style; }),

      addBookmark: (input) =>
        set((state) => {
          if (!state.bookmarks[input.bookId]) state.bookmarks[input.bookId] = [];
          const now = new Date().toISOString();
          state.bookmarks[input.bookId].push({
            ...input,
            serverId: null,
            updatedAt: now,
            version: 1,
            dirty: true,
            deletedAt: null,
          });
        }),

      removeBookmark: (bookId, bookmarkId) =>
        set((state) => {
          const b = state.bookmarks[bookId]?.find((b) => b.id === bookmarkId);
          if (b && !b.deletedAt) {
            b.deletedAt = new Date().toISOString();
            b.updatedAt = b.deletedAt;
            b.version += 1;
            b.dirty = true;
          }
        }),

      getBookHighlights: (bookId) =>
        (get().highlights[bookId] ?? []).filter((h) => !h.deletedAt),
      getBookBookmarks: (bookId) =>
        (get().bookmarks[bookId] ?? []).filter((b) => !b.deletedAt),

      // ===== Sync engine actions =====

      markHighlightSynced: (localId, serverId, syncedAt) =>
        set((state) => {
          for (const list of Object.values(state.highlights)) {
            const h = list.find((x) => x.id === localId);
            if (h) {
              if (serverId !== null) h.serverId = serverId;
              h.dirty = false;
              h.syncedAt = syncedAt;
              return;
            }
          }
        }),

      markBookmarkSynced: (localId, serverId, syncedAt) =>
        set((state) => {
          for (const list of Object.values(state.bookmarks)) {
            const b = list.find((x) => x.id === localId);
            if (b) {
              if (serverId !== null) b.serverId = serverId;
              b.dirty = false;
              b.syncedAt = syncedAt;
              return;
            }
          }
        }),

      applyServerHighlight: (incoming) =>
        set((state) => {
          if (!state.highlights[incoming.bookId]) state.highlights[incoming.bookId] = [];
          const list = state.highlights[incoming.bookId];
          // Match by serverId (preferred) or by local id (records pushed but server echoed back).
          const idx = list.findIndex(
            (h) =>
              (incoming.serverId && h.serverId === incoming.serverId) || h.id === incoming.id,
          );
          if (idx === -1) {
            list.push({ ...incoming, dirty: false });
            return;
          }
          const local = list[idx];
          // LWW: keep local if dirty + locally newer.
          if (local.dirty && new Date(local.updatedAt).getTime() > new Date(incoming.updatedAt).getTime()) {
            return;
          }
          list[idx] = { ...incoming, note: local.note ?? incoming.note, dirty: false };
        }),

      applyServerBookmark: (incoming) =>
        set((state) => {
          if (!state.bookmarks[incoming.bookId]) state.bookmarks[incoming.bookId] = [];
          const list = state.bookmarks[incoming.bookId];
          const idx = list.findIndex(
            (b) =>
              (incoming.serverId && b.serverId === incoming.serverId) || b.id === incoming.id,
          );
          if (idx === -1) {
            list.push({ ...incoming, dirty: false });
            return;
          }
          const local = list[idx];
          if (local.dirty && new Date(local.updatedAt).getTime() > new Date(incoming.updatedAt).getTime()) {
            return;
          }
          list[idx] = { ...incoming, dirty: false };
        }),

      hardRemoveHighlight: (localId) =>
        set((state) => {
          for (const bookId of Object.keys(state.highlights)) {
            state.highlights[bookId] = state.highlights[bookId].filter((h) => h.id !== localId);
          }
        }),

      hardRemoveBookmark: (localId) =>
        set((state) => {
          for (const bookId of Object.keys(state.bookmarks)) {
            state.bookmarks[bookId] = state.bookmarks[bookId].filter((b) => b.id !== localId);
          }
        }),

      getDirtyHighlights: () => flat(get().highlights).filter((h) => h.dirty),
      getDirtyBookmarks: () => flat(get().bookmarks).filter((b) => b.dirty),

      setLastFullPullAt: (iso) => set((state) => { state.lastFullPullAt = iso; }),
    })),
    {
      name: 'highlight-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORAGE_VERSION,
      // v0/v1 → v2: backfill sync fields and serverId; drop legacy Bookmark.note.
      migrate: (persistedState, fromVersion) => {
        if (fromVersion >= STORAGE_VERSION) return persistedState as HighlightState;
        const s = (persistedState ?? {}) as Partial<HighlightState> & {
          highlights?: Record<string, Partial<Highlight>[]>;
          bookmarks?: Record<string, Partial<Bookmark>[]>;
        };
        const backfillHighlight = (h: Partial<Highlight>): Highlight => ({
          ...(h as Highlight),
          serverId: h.serverId ?? null,
          updatedAt: h.updatedAt ?? h.createdAt ?? new Date(0).toISOString(),
          version: h.version ?? 1,
          dirty: h.dirty ?? false,
          deletedAt: h.deletedAt ?? null,
        });
        const backfillBookmark = (b: Partial<Bookmark>): Bookmark => ({
          ...(b as Bookmark),
          serverId: b.serverId ?? null,
          updatedAt: b.updatedAt ?? b.createdAt ?? new Date(0).toISOString(),
          version: b.version ?? 1,
          dirty: b.dirty ?? false,
          deletedAt: b.deletedAt ?? null,
        });
        const highlights: Record<string, Highlight[]> = {};
        for (const [k, list] of Object.entries(s.highlights ?? {})) {
          highlights[k] = (list as Partial<Highlight>[]).map(backfillHighlight);
        }
        const bookmarks: Record<string, Bookmark[]> = {};
        for (const [k, list] of Object.entries(s.bookmarks ?? {})) {
          bookmarks[k] = (list as Partial<Bookmark>[]).map(backfillBookmark);
        }
        return {
          highlights,
          bookmarks,
          activeColor: s.activeColor ?? 'yellow',
          activeStyle: s.activeStyle ?? 'background',
          lastFullPullAt: s.lastFullPullAt ?? null,
        } as HighlightState;
      },
    },
  ),
);

export { findById };
