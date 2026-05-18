// eslint-disable-next-line no-restricted-imports -- sync engine deliberately bypasses the reader facade to avoid pulling in heavy UI deps (bottom-sheet → worklets) at startup
import { useHighlightStore } from '@/features/reader/stores/highlightStore';
import { highlightsApi } from '@/services/api/highlights';
import { bookmarksApi } from '@/services/api/bookmarks';
import { syncAnnotationsApi, SyncAnnotationsRequest } from '@/services/api/syncAnnotations';
import { Sentry } from '@/services/crashTracking';
import {
  dtoToHighlight,
  dtoToBookmark,
  highlightToCreateDto,
  highlightToUpdateDto,
  bookmarkToCreateDto,
} from './converters';

type AxiosError = { response?: { status?: number } };

function statusOf(err: unknown): number | undefined {
  return (err as AxiosError | undefined)?.response?.status;
}

class SyncEngine {
  private inFlight: Promise<void> | null = null;
  private lastSuccessAt = 0;

  /** Returns ms since last successful sync round, or Infinity if never synced. */
  msSinceLastSync(): number {
    return this.lastSuccessAt === 0 ? Number.POSITIVE_INFINITY : Date.now() - this.lastSuccessAt;
  }

  async pullAll(): Promise<void> {
    const store = useHighlightStore.getState();
    let serverHighlights: Awaited<ReturnType<typeof highlightsApi.getAll>> = [];
    let serverBookmarks: Awaited<ReturnType<typeof bookmarksApi.getAll>> = [];
    try {
      [serverHighlights, serverBookmarks] = await Promise.all([
        highlightsApi.getAll(),
        bookmarksApi.getAll(),
      ]);
    } catch (err) {
      // 401 will be retried by axios interceptor; here we just bail.
      if (statusOf(err) === 401) return;
      Sentry.captureException(err);
      return;
    }

    for (const dto of serverHighlights) {
      const local = dtoToHighlight(dto);
      if (local) store.applyServerHighlight(local);
    }
    for (const dto of serverBookmarks) {
      const local = dtoToBookmark(dto);
      if (local) store.applyServerBookmark(local);
    }

    // Prune orphans: local has serverId, server no longer returns it, local isn't dirty.
    const seenH = new Set(serverHighlights.map((h) => h.id));
    const seenB = new Set(serverBookmarks.map((b) => b.id));
    const allLocalHighlights = Object.values(useHighlightStore.getState().highlights).flat();
    const allLocalBookmarks = Object.values(useHighlightStore.getState().bookmarks).flat();
    for (const h of allLocalHighlights) {
      if (h.serverId && !seenH.has(h.serverId) && !h.dirty) {
        store.hardRemoveHighlight(h.id);
      }
    }
    for (const b of allLocalBookmarks) {
      if (b.serverId && !seenB.has(b.serverId) && !b.dirty) {
        store.hardRemoveBookmark(b.id);
      }
    }

    store.setLastFullPullAt(new Date().toISOString());
  }

  async pushDirty(): Promise<void> {
    const store = useHighlightStore.getState();
    const dirtyHighlights = store.getDirtyHighlights();
    const dirtyBookmarks = store.getDirtyBookmarks();

    // Path b: existing highlights with edits → PATCH /highlights/:id (one by one).
    const updates = dirtyHighlights.filter((h) => h.serverId && !h.deletedAt);
    for (const h of updates) {
      try {
        await highlightsApi.update(h.serverId!, highlightToUpdateDto(h));
        store.markHighlightSynced(h.id, h.serverId, new Date().toISOString());
      } catch (err) {
        if (statusOf(err) === 401) return;
        Sentry.captureException(err);
      }
    }

    // Path d: tombstones without serverId — never reached server, just drop locally.
    const orphanDelH = dirtyHighlights.filter((h) => !h.serverId && h.deletedAt);
    const orphanDelB = dirtyBookmarks.filter((b) => !b.serverId && b.deletedAt);
    for (const h of orphanDelH) store.hardRemoveHighlight(h.id);
    for (const b of orphanDelB) store.hardRemoveBookmark(b.id);

    // Path a + c: batch creates and tombstones via /annotations/sync (subscriber-gated).
    const createH = dirtyHighlights.filter((h) => !h.serverId && !h.deletedAt);
    const createB = dirtyBookmarks
      .filter((b) => !b.serverId && !b.deletedAt)
      .map((b) => ({ b, dto: bookmarkToCreateDto(b) }))
      .filter((x): x is { b: typeof x.b; dto: NonNullable<typeof x.dto> } => x.dto !== null);
    const delH = dirtyHighlights.filter((h) => h.serverId && h.deletedAt);
    const delB = dirtyBookmarks.filter((b) => b.serverId && b.deletedAt);

    const hasWork =
      createH.length > 0 || createB.length > 0 || delH.length > 0 || delB.length > 0;
    if (!hasWork) {
      this.lastSuccessAt = Date.now();
      return;
    }

    const payload: SyncAnnotationsRequest = {
      highlights: createH.map((h) => ({ ...highlightToCreateDto(h), localId: h.id })),
      bookmarks: createB.map(({ b, dto }) => ({ ...dto, localId: b.id })),
      deletedHighlightIds: delH.map((h) => h.serverId!),
      deletedBookmarkIds: delB.map((b) => b.serverId!),
    };

    try {
      const resp = await syncAnnotationsApi.sync(payload);
      const now = new Date().toISOString();
      for (const { localId, serverId } of resp.createdHighlights) {
        store.markHighlightSynced(localId, serverId, now);
      }
      for (const { localId, serverId } of resp.createdBookmarks) {
        store.markBookmarkSynced(localId, serverId, now);
      }
      // Server accepted tombstones (count returned, not IDs) — hard remove locally.
      // If server rejected some, they remain dirty and retry next round.
      if (resp.deletedHighlights > 0) {
        for (const h of delH) store.hardRemoveHighlight(h.id);
      }
      if (resp.deletedBookmarks > 0) {
        for (const b of delB) store.hardRemoveBookmark(b.id);
      }
      this.lastSuccessAt = Date.now();
    } catch (err) {
      const status = statusOf(err);
      if (status === 403) {
        Sentry.addBreadcrumb({
          category: 'sync',
          message: 'annotations sync skipped — non-subscriber (403)',
          level: 'info',
        });
        return;
      }
      if (status === 401) return; // auth interceptor handles refresh
      Sentry.captureException(err);
    }
  }

  /** Push then pull. Coalesces concurrent calls. */
  async sync(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      try {
        await this.pushDirty();
        await this.pullAll();
      } finally {
        this.inFlight = null;
      }
    })();
    return this.inFlight;
  }
}

export const syncEngine = new SyncEngine();
