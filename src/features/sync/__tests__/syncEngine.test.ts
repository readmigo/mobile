import {
  useHighlightStore,
  HighlightInput,
  BookmarkInput,
} from '@/features/reader/stores/highlightStore';
import { highlightsApi } from '@/services/api/highlights';
import { bookmarksApi } from '@/services/api/bookmarks';
import { syncAnnotationsApi } from '@/services/api/syncAnnotations';
import { syncEngine } from '../syncEngine';

jest.mock('@/services/api/highlights', () => ({
  highlightsApi: {
    getAll: jest.fn(),
    getByBook: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/services/api/bookmarks', () => ({
  bookmarksApi: {
    getAll: jest.fn(),
    getByBook: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/services/api/syncAnnotations', () => ({
  syncAnnotationsApi: { sync: jest.fn() },
}));

jest.mock('@/services/crashTracking', () => ({
  Sentry: {
    captureException: jest.fn(),
    addBreadcrumb: jest.fn(),
  },
}));

const hApi = highlightsApi as jest.Mocked<typeof highlightsApi>;
const bApi = bookmarksApi as jest.Mocked<typeof bookmarksApi>;
const sApi = syncAnnotationsApi as jest.Mocked<typeof syncAnnotationsApi>;

const baseHighlight: HighlightInput = {
  id: 'local-h1',
  bookId: 'book-1',
  chapterId: 'ch1',
  selectedText: 'hi',
  color: 'yellow',
  style: 'background',
  paragraphIndex: 0,
  charOffset: 0,
  charLength: 2,
  createdAt: '2026-01-01T00:00:00Z',
};

const baseBookmark: BookmarkInput = {
  id: 'local-b1',
  bookId: 'book-1',
  chapterId: 'ch1', // required for push
  chapterIndex: 0,
  paragraphIndex: 0,
  scrollPercentage: 0.1,
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useHighlightStore.setState({
    highlights: {},
    bookmarks: {},
    lastFullPullAt: null,
  });
  hApi.getAll.mockResolvedValue([]);
  bApi.getAll.mockResolvedValue([]);
});

describe('syncEngine.pushDirty — path a (new creates via batch sync)', () => {
  it('sends new dirty highlights to /annotations/sync and writes back serverId', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    sApi.sync.mockResolvedValue({
      createdHighlights: [{ localId: 'local-h1', serverId: 'srv-h1' }],
      createdAnnotations: [],
      createdBookmarks: [],
      deletedHighlights: 0,
      deletedAnnotations: 0,
      deletedBookmarks: 0,
    });

    await syncEngine.pushDirty();

    expect(sApi.sync).toHaveBeenCalledTimes(1);
    const sent = sApi.sync.mock.calls[0][0];
    expect(sent.highlights).toHaveLength(1);
    expect(sent.highlights![0].localId).toBe('local-h1');

    const after = useHighlightStore.getState().highlights['book-1'][0];
    expect(after.serverId).toBe('srv-h1');
    expect(after.dirty).toBe(false);
  });
});

describe('syncEngine.pushDirty — path b (PATCH existing highlights)', () => {
  it('calls update endpoint for dirty highlights that already have serverId', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-h1', '2026-01-01T01:00:00Z');
    // Edit it
    useHighlightStore.getState().updateHighlightNote('book-1', 'local-h1', 'a note');
    // Color change via direct set (the only mutable field via PATCH)
    useHighlightStore.setState((s) => {
      const h = s.highlights['book-1'][0];
      h.color = 'green';
      h.dirty = true;
    });

    hApi.update.mockResolvedValue({} as never);

    await syncEngine.pushDirty();

    expect(hApi.update).toHaveBeenCalledWith('srv-h1', expect.objectContaining({ color: 'green' }));
    const after = useHighlightStore.getState().highlights['book-1'][0];
    expect(after.dirty).toBe(false);
    // sync batch should not have been called since there are no creates/deletes
    expect(sApi.sync).not.toHaveBeenCalled();
  });
});

describe('syncEngine.pushDirty — path c (delete with serverId)', () => {
  it('sends serverId in deletedHighlightIds and hard-removes locally on success', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-h1', 'x');
    useHighlightStore.getState().removeHighlight('book-1', 'local-h1');

    sApi.sync.mockResolvedValue({
      createdHighlights: [], createdAnnotations: [], createdBookmarks: [],
      deletedHighlights: 1, deletedAnnotations: 0, deletedBookmarks: 0,
    });

    await syncEngine.pushDirty();

    const sent = sApi.sync.mock.calls[0][0];
    expect(sent.deletedHighlightIds).toEqual(['srv-h1']);
    expect(useHighlightStore.getState().highlights['book-1']).toHaveLength(0);
  });
});

describe('syncEngine.pushDirty — path d (delete without serverId is local-only)', () => {
  it('hard-removes locally and makes no network call', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().removeHighlight('book-1', 'local-h1');

    await syncEngine.pushDirty();

    expect(sApi.sync).not.toHaveBeenCalled();
    expect(useHighlightStore.getState().highlights['book-1']).toHaveLength(0);
  });
});

describe('syncEngine.pushDirty — failure modes', () => {
  it('403 from sync (non-subscriber) exits silently without throwing', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    sApi.sync.mockRejectedValue({ response: { status: 403 } });

    await expect(syncEngine.pushDirty()).resolves.toBeUndefined();
    // local record remains dirty
    expect(useHighlightStore.getState().highlights['book-1'][0].dirty).toBe(true);
  });

  it('one PATCH failure does not abort the loop', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().addHighlight({ ...baseHighlight, id: 'local-h2' });
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-h1', 'x');
    useHighlightStore.getState().markHighlightSynced('local-h2', 'srv-h2', 'x');
    useHighlightStore.setState((s) => {
      s.highlights['book-1'].forEach((h) => { h.dirty = true; });
    });

    hApi.update.mockImplementation((id) => {
      if (id === 'srv-h1') return Promise.reject({ response: { status: 500 } });
      return Promise.resolve({} as never);
    });

    await syncEngine.pushDirty();

    expect(hApi.update).toHaveBeenCalledTimes(2);
    const list = useHighlightStore.getState().highlights['book-1'];
    expect(list.find((h) => h.serverId === 'srv-h1')!.dirty).toBe(true);  // failed → still dirty
    expect(list.find((h) => h.serverId === 'srv-h2')!.dirty).toBe(false); // succeeded
  });
});

describe('syncEngine.pullAll', () => {
  it('inserts new server highlights as non-dirty with serverId set', async () => {
    hApi.getAll.mockResolvedValue([
      {
        id: 'srv-h1',
        userId: 'u',
        userBookId: 'ub',
        chapterId: 'ch1',
        startOffset: 0,
        endOffset: 5,
        selectedText: 'hello',
        color: 'yellow',
        style: 'background',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        userBook: { bookId: 'book-1' },
      },
    ]);

    await syncEngine.pullAll();

    const list = useHighlightStore.getState().highlights['book-1'];
    expect(list).toHaveLength(1);
    expect(list[0].serverId).toBe('srv-h1');
    expect(list[0].dirty).toBe(false);
    expect(useHighlightStore.getState().lastFullPullAt).not.toBeNull();
  });

  it('LWW: keeps local when local is dirty and locally newer', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-h1', '2026-01-01T00:00:00Z');
    useHighlightStore.setState((s) => {
      const h = s.highlights['book-1'][0];
      h.color = 'green';
      h.updatedAt = '2026-01-02T00:00:00Z'; // local newer
      h.dirty = true;
    });

    hApi.getAll.mockResolvedValue([
      {
        id: 'srv-h1',
        userId: 'u',
        userBookId: 'ub',
        chapterId: 'ch1',
        startOffset: 0,
        endOffset: 2,
        selectedText: 'hi',
        color: 'yellow', // server still says yellow
        style: 'background',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T12:00:00Z', // server older than local
        userBook: { bookId: 'book-1' },
      },
    ]);

    await syncEngine.pullAll();

    const after = useHighlightStore.getState().highlights['book-1'][0];
    expect(after.color).toBe('green'); // local kept
    expect(after.dirty).toBe(true);
  });

  it('overwrites local when server is newer and local is not dirty', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-h1', '2026-01-01T00:00:00Z');

    hApi.getAll.mockResolvedValue([
      {
        id: 'srv-h1',
        userId: 'u',
        userBookId: 'ub',
        chapterId: 'ch1',
        startOffset: 0,
        endOffset: 2,
        selectedText: 'hi',
        color: 'pink', // server updated
        style: 'background',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
        userBook: { bookId: 'book-1' },
      },
    ]);

    await syncEngine.pullAll();

    const after = useHighlightStore.getState().highlights['book-1'][0];
    expect(after.color).toBe('pink');
    expect(after.dirty).toBe(false);
  });

  it('prunes local records whose serverId no longer appears on server', async () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('local-h1', 'srv-gone', 'x');
    hApi.getAll.mockResolvedValue([]); // server has none

    await syncEngine.pullAll();

    expect(useHighlightStore.getState().highlights['book-1']).toHaveLength(0);
  });
});

describe('syncEngine.pullAll — bookmark sync field', () => {
  it('initialises lastFullPullAt on every successful pull', async () => {
    expect(useHighlightStore.getState().lastFullPullAt).toBeNull();
    await syncEngine.pullAll();
    expect(useHighlightStore.getState().lastFullPullAt).not.toBeNull();
  });
});
