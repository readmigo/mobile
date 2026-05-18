import {
  mapStyleToServer,
  mapStyleFromServer,
  dtoToHighlight,
  dtoToBookmark,
  highlightToCreateDto,
  highlightToUpdateDto,
  bookmarkToCreateDto,
} from '../converters';
import type { HighlightDto } from '@/services/api/highlights';
import type { BookmarkDto } from '@/services/api/bookmarks';
import type { Highlight, Bookmark } from '@/features/reader';

describe('converters — style mapping', () => {
  it('boldLine ↔ bold_line', () => {
    expect(mapStyleToServer('boldLine')).toBe('bold_line');
    expect(mapStyleFromServer('bold_line')).toBe('boldLine');
  });

  it('identity for other styles', () => {
    expect(mapStyleToServer('underline')).toBe('underline');
    expect(mapStyleToServer('wavy')).toBe('wavy');
    expect(mapStyleToServer('background')).toBe('background');
    expect(mapStyleFromServer('background')).toBe('background');
  });

  it('unknown server style falls back to background', () => {
    expect(mapStyleFromServer('unknown')).toBe('background');
    expect(mapStyleFromServer(undefined)).toBe('background');
  });
});

describe('converters — dtoToHighlight', () => {
  const baseDto: HighlightDto = {
    id: 'srv-1',
    userId: 'u1',
    userBookId: 'ub1',
    chapterId: 'ch1',
    startOffset: 0,
    endOffset: 5,
    selectedText: 'hello',
    color: 'yellow',
    style: 'background',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    userBook: { bookId: 'book-1' },
  };

  it('maps server highlight to store shape with serverId and bookId from userBook join', () => {
    const h = dtoToHighlight(baseDto)!;
    expect(h.serverId).toBe('srv-1');
    expect(h.id).toBe('h_srv-1');
    expect(h.bookId).toBe('book-1');
    expect(h.dirty).toBe(false);
    expect(h.deletedAt).toBeNull();
  });

  it('returns null when bookId cannot be derived', () => {
    const { userBook: _drop, ...withoutUserBook } = baseDto;
    expect(dtoToHighlight(withoutUserBook as HighlightDto)).toBeNull();
  });

  it('defaults paragraphIndex/charOffset/charLength when server omits them', () => {
    const h = dtoToHighlight(baseDto)!;
    expect(h.paragraphIndex).toBe(0);
    expect(h.charOffset).toBe(0);
    expect(h.charLength).toBe('hello'.length);
  });

  it('maps server bold_line back to boldLine', () => {
    const h = dtoToHighlight({ ...baseDto, style: 'bold_line' })!;
    expect(h.style).toBe('boldLine');
  });

  it('unknown server color falls back to yellow', () => {
    const h = dtoToHighlight({ ...baseDto, color: 'magenta' })!;
    expect(h.color).toBe('yellow');
  });
});

describe('converters — dtoToBookmark', () => {
  const baseDto: BookmarkDto = {
    id: 'srv-b1',
    userId: 'u1',
    userBookId: 'ub1',
    chapterId: 'ch1',
    scrollPosition: 0.3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    userBook: { bookId: 'book-1' },
  };

  it('maps server bookmark to store shape, scrollPosition → scrollPercentage', () => {
    const b = dtoToBookmark(baseDto)!;
    expect(b.serverId).toBe('srv-b1');
    expect(b.id).toBe('b_srv-b1');
    expect(b.scrollPercentage).toBe(0.3);
    expect(b.chapterIndex).toBe(0);
  });
});

describe('converters — store → server', () => {
  const localH: Highlight = {
    id: 'local-1',
    serverId: null,
    bookId: 'book-1',
    chapterId: 'ch1',
    selectedText: 'hi',
    color: 'green',
    style: 'boldLine',
    paragraphIndex: 2,
    charOffset: 3,
    charLength: 2,
    cfiPath: '/cfi/1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    dirty: true,
    deletedAt: null,
  };

  it('highlightToCreateDto translates style and uses charLength as endOffset', () => {
    const dto = highlightToCreateDto(localH);
    expect(dto.style).toBe('bold_line');
    expect(dto.endOffset).toBe(2);
    expect(dto.cfiPath).toBe('/cfi/1');
  });

  it('highlightToUpdateDto includes only mutable fields', () => {
    const dto = highlightToUpdateDto(localH);
    expect(dto.color).toBe('green');
    expect(dto.style).toBe('bold_line');
    expect(dto).not.toHaveProperty('createdAt');
  });

  it('bookmarkToCreateDto returns null when chapterId is missing', () => {
    const b: Bookmark = {
      id: 'lb1',
      serverId: null,
      bookId: 'book-1',
      chapterIndex: 0,
      paragraphIndex: 0,
      scrollPercentage: 0,
      createdAt: 'x',
      updatedAt: 'x',
      version: 1,
      dirty: true,
      deletedAt: null,
    };
    expect(bookmarkToCreateDto(b)).toBeNull();
  });

  it('bookmarkToCreateDto succeeds when chapterId is present', () => {
    const b: Bookmark = {
      id: 'lb1',
      serverId: null,
      bookId: 'book-1',
      chapterId: 'ch1',
      chapterIndex: 2,
      paragraphIndex: 0,
      scrollPercentage: 0.5,
      createdAt: 'x',
      updatedAt: 'x',
      version: 1,
      dirty: true,
      deletedAt: null,
    };
    const dto = bookmarkToCreateDto(b);
    expect(dto).not.toBeNull();
    expect(dto?.chapterId).toBe('ch1');
    expect(dto?.scrollPercentage).toBe(0.5);
  });
});
