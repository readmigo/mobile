import type {
  Highlight,
  Bookmark,
  HighlightColor,
  HighlightStyle,
} from '@/features/reader';
import type { HighlightDto, CreateHighlightDto, UpdateHighlightDto } from '@/services/api/highlights';
import type { BookmarkDto, CreateBookmarkDto } from '@/services/api/bookmarks';

const HIGHLIGHT_COLORS_SET: Set<string> = new Set([
  'yellow', 'green', 'blue', 'pink', 'purple', 'orange',
]);

export function mapStyleToServer(style: HighlightStyle): string {
  return style === 'boldLine' ? 'bold_line' : style;
}

export function mapStyleFromServer(serverStyle: string | undefined): HighlightStyle {
  if (serverStyle === 'bold_line') return 'boldLine';
  if (serverStyle === 'underline' || serverStyle === 'wavy' || serverStyle === 'background') {
    return serverStyle;
  }
  return 'background';
}

function mapColorFromServer(color: string): HighlightColor {
  return (HIGHLIGHT_COLORS_SET.has(color) ? color : 'yellow') as HighlightColor;
}

function localIdFromServer(prefix: string, serverId: string): string {
  return `${prefix}_${serverId}`;
}

function extractBookId(userBook?: { bookId: string }, fallbackUserBookId?: string): string | null {
  if (userBook?.bookId) return userBook.bookId;
  // No userBook joined on the response — caller must supply context. We can't synthesize a bookId
  // from userBookId alone. Returning null lets the caller skip or warn.
  void fallbackUserBookId;
  return null;
}

/** Server → store. Returns null if a required local field cannot be derived (e.g. missing bookId). */
export function dtoToHighlight(dto: HighlightDto): Highlight | null {
  const bookId = extractBookId(dto.userBook, dto.userBookId);
  if (!bookId) return null;
  return {
    id: localIdFromServer('h', dto.id),
    serverId: dto.id,
    bookId,
    chapterId: dto.chapterId,
    selectedText: dto.selectedText,
    color: mapColorFromServer(dto.color),
    style: mapStyleFromServer(dto.style),
    paragraphIndex: dto.paragraphIndex ?? 0,
    charOffset: dto.charOffset ?? 0,
    charLength: dto.charLength ?? dto.selectedText.length,
    cfiPath: dto.cfiRange,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    version: 1,
    dirty: false,
    deletedAt: null,
    syncedAt: dto.syncedAt ?? dto.updatedAt,
  };
}

export function dtoToBookmark(dto: BookmarkDto): Bookmark | null {
  const bookId = extractBookId(dto.userBook, dto.userBookId);
  if (!bookId) return null;
  return {
    id: localIdFromServer('b', dto.id),
    serverId: dto.id,
    bookId,
    chapterId: dto.chapterId,
    chapterIndex: 0, // server response omits chapterIndex; UI re-derives on next interaction
    paragraphIndex: 0,
    scrollPercentage: dto.scrollPosition ?? 0,
    cfiPath: dto.cfi,
    title: dto.title,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    version: 1,
    dirty: false,
    deletedAt: null,
    syncedAt: dto.syncedAt ?? dto.updatedAt,
  };
}

/** Store → server for batch create. */
export function highlightToCreateDto(h: Highlight): CreateHighlightDto {
  return {
    bookId: h.bookId,
    chapterId: h.chapterId,
    selectedText: h.selectedText,
    color: h.color,
    style: mapStyleToServer(h.style),
    paragraphIndex: h.paragraphIndex,
    charOffset: h.charOffset,
    charLength: h.charLength,
    cfiPath: h.cfiPath,
    startOffset: 0,
    endOffset: h.charLength,
  };
}

/** Store → server for PATCH. Only mutable fields. */
export function highlightToUpdateDto(h: Highlight): UpdateHighlightDto {
  return {
    color: h.color,
    style: mapStyleToServer(h.style),
    selectedText: h.selectedText,
    paragraphIndex: h.paragraphIndex,
    charOffset: h.charOffset,
    charLength: h.charLength,
    cfiRange: h.cfiPath,
  };
}

/** Store → server for batch create. Returns null if local record lacks chapterId (cannot push). */
export function bookmarkToCreateDto(b: Bookmark): CreateBookmarkDto | null {
  if (!b.chapterId) return null;
  return {
    bookId: b.bookId,
    chapterId: b.chapterId,
    chapterIndex: b.chapterIndex,
    cfi: b.cfiPath,
    scrollPercentage: b.scrollPercentage,
    title: b.title,
  };
}
