import { useHighlightStore, HighlightInput, BookmarkInput } from '../highlightStore';

const baseHighlight: HighlightInput = {
  id: 'h1',
  bookId: 'book-1',
  chapterId: 'ch-1',
  selectedText: 'hello world',
  color: 'yellow',
  style: 'background',
  paragraphIndex: 0,
  charOffset: 0,
  charLength: 11,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const baseBookmark: BookmarkInput = {
  id: 'b1',
  bookId: 'book-1',
  chapterIndex: 0,
  paragraphIndex: 5,
  scrollPercentage: 0.42,
  createdAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  useHighlightStore.setState({ highlights: {}, bookmarks: {} });
});

describe('highlightStore — highlight sync semantics', () => {
  it('addHighlight initialises version=1, dirty=true, deletedAt=null', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    const [h] = useHighlightStore.getState().highlights['book-1'];
    expect(h.version).toBe(1);
    expect(h.dirty).toBe(true);
    expect(h.deletedAt).toBeNull();
    expect(h.updatedAt).toBeDefined();
  });

  it('updateHighlightNote bumps version and sets dirty=true', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.setState((s) => {
      // Simulate sync clearing dirty
      s.highlights['book-1'][0].dirty = false;
    });
    useHighlightStore.getState().updateHighlightNote('book-1', 'h1', 'a note');
    const [h] = useHighlightStore.getState().highlights['book-1'];
    expect(h.version).toBe(2);
    expect(h.dirty).toBe(true);
    expect(h.note).toBe('a note');
  });

  it('removeHighlight is a soft delete (sets deletedAt, dirty, bumps version)', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().removeHighlight('book-1', 'h1');
    const [h] = useHighlightStore.getState().highlights['book-1'];
    expect(h.deletedAt).not.toBeNull();
    expect(h.version).toBe(2);
    expect(h.dirty).toBe(true);
  });

  it('removeHighlight is idempotent — second call does not rebump version', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().removeHighlight('book-1', 'h1');
    const firstVersion = useHighlightStore.getState().highlights['book-1'][0].version;
    useHighlightStore.getState().removeHighlight('book-1', 'h1');
    const secondVersion = useHighlightStore.getState().highlights['book-1'][0].version;
    expect(secondVersion).toBe(firstVersion);
  });

  it('getBookHighlights filters out soft-deleted entries', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().addHighlight({ ...baseHighlight, id: 'h2' });
    useHighlightStore.getState().removeHighlight('book-1', 'h1');
    const visible = useHighlightStore.getState().getBookHighlights('book-1');
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('h2');
  });

  it('updateHighlightNote on deleted entry is a no-op', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().removeHighlight('book-1', 'h1');
    const versionAfterDelete = useHighlightStore.getState().highlights['book-1'][0].version;
    useHighlightStore.getState().updateHighlightNote('book-1', 'h1', 'ignored');
    const h = useHighlightStore.getState().highlights['book-1'][0];
    expect(h.note).toBeUndefined();
    expect(h.version).toBe(versionAfterDelete);
  });
});

describe('highlightStore — bookmark sync semantics', () => {
  it('addBookmark initialises sync fields', () => {
    useHighlightStore.getState().addBookmark(baseBookmark);
    const [b] = useHighlightStore.getState().bookmarks['book-1'];
    expect(b.version).toBe(1);
    expect(b.dirty).toBe(true);
    expect(b.deletedAt).toBeNull();
  });

  it('removeBookmark soft-deletes and bumps version', () => {
    useHighlightStore.getState().addBookmark(baseBookmark);
    useHighlightStore.getState().removeBookmark('book-1', 'b1');
    const [b] = useHighlightStore.getState().bookmarks['book-1'];
    expect(b.deletedAt).not.toBeNull();
    expect(b.version).toBe(2);
    expect(b.dirty).toBe(true);
  });

  it('getBookBookmarks filters out soft-deleted entries', () => {
    useHighlightStore.getState().addBookmark(baseBookmark);
    useHighlightStore.getState().addBookmark({ ...baseBookmark, id: 'b2' });
    useHighlightStore.getState().removeBookmark('book-1', 'b1');
    const visible = useHighlightStore.getState().getBookBookmarks('book-1');
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('b2');
  });
});

describe('highlightStore — v2 sync fields', () => {
  it('new records have serverId=null', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().addBookmark(baseBookmark);
    expect(useHighlightStore.getState().highlights['book-1'][0].serverId).toBeNull();
    expect(useHighlightStore.getState().bookmarks['book-1'][0].serverId).toBeNull();
  });

  it('markHighlightSynced clears dirty and writes serverId', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().markHighlightSynced('h1', 'srv-h1', '2026-01-02T00:00:00Z');
    const h = useHighlightStore.getState().highlights['book-1'][0];
    expect(h.serverId).toBe('srv-h1');
    expect(h.dirty).toBe(false);
    expect(h.syncedAt).toBe('2026-01-02T00:00:00Z');
  });

  it('hardRemoveHighlight physically removes the record', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().hardRemoveHighlight('h1');
    expect(useHighlightStore.getState().highlights['book-1']).toHaveLength(0);
  });

  it('getDirtyHighlights returns only dirty records across all books', () => {
    useHighlightStore.getState().addHighlight(baseHighlight);
    useHighlightStore.getState().addHighlight({ ...baseHighlight, id: 'h2', bookId: 'book-2' });
    useHighlightStore.getState().markHighlightSynced('h1', 'srv', 'x');
    const dirty = useHighlightStore.getState().getDirtyHighlights();
    expect(dirty.map((h) => h.id)).toEqual(['h2']);
  });

  it('setLastFullPullAt writes the timestamp', () => {
    expect(useHighlightStore.getState().lastFullPullAt).toBeNull();
    useHighlightStore.getState().setLastFullPullAt('2026-05-18T00:00:00Z');
    expect(useHighlightStore.getState().lastFullPullAt).toBe('2026-05-18T00:00:00Z');
  });
});
