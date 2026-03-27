import { useCallback } from 'react';
import { File, Paths, Directory } from 'expo-file-system/next';
import { booksApi } from '@/services/api/books';
import { useOfflineStore, OfflineBook } from '../stores/offlineStore';

const CACHE_DIR_NAME = 'offline-books';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getCacheDir(): Directory {
  return new Directory(Paths.document, CACHE_DIR_NAME);
}

function ensureCacheDir() {
  const dir = getCacheDir();
  if (!dir.exists) {
    dir.create();
  }
}

export function useOfflineBook(bookId: string, bookTitle?: string) {
  const book = useOfflineStore((s) => s.getBook(bookId));
  const isDownloaded = useOfflineStore((s) => s.isDownloaded(bookId));
  const setBook = useOfflineStore((s) => s.setBook);
  const removeBook = useOfflineStore((s) => s.removeBook);
  const updateProgress = useOfflineStore((s) => s.updateProgress);
  const setStatus = useOfflineStore((s) => s.setStatus);

  const download = useCallback(async () => {
    try {
      ensureCacheDir();

      // Get content URL
      const response = await booksApi.getBookContent(bookId);
      const remoteUrl = response.data.url;
      const localFile = new File(getCacheDir(), `${bookId}.epub`);
      const localPath = localFile.uri;

      // Create initial record
      const offlineBook: OfflineBook = {
        bookId,
        title: bookTitle ?? bookId,
        filePath: localPath,
        fileSize: 0,
        downloadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
        status: 'downloading',
        progress: 0,
      };
      setBook(offlineBook);

      // Download file
      const downloadedFile = await File.downloadFileAsync(remoteUrl, localFile);
      const size = downloadedFile.size ?? 0;

      setBook({
        ...offlineBook,
        fileSize: size,
        status: 'completed',
        progress: 1,
      });
    } catch (error) {
      setStatus(bookId, 'failed');
      console.error('[Offline] Download failed:', error);
    }
  }, [bookId, bookTitle, setBook, setStatus]);

  const remove = useCallback(async () => {
    const cachedBook = useOfflineStore.getState().getBook(bookId);
    if (cachedBook?.filePath) {
      try {
        const file = new File(cachedBook.filePath);
        if (file.exists) file.delete();
      } catch {}
    }
    removeBook(bookId);
  }, [bookId, removeBook]);

  return {
    offlineBook: book,
    isDownloaded,
    isDownloading: book?.status === 'downloading',
    downloadProgress: book?.progress ?? 0,
    download,
    remove,
  };
}

export function useOfflineManager() {
  const books = useOfflineStore((s) => s.books);
  const totalSize = useOfflineStore((s) => s.getTotalCacheSize());
  const clearExpired = useOfflineStore((s) => s.clearExpired);
  const clearAll = useOfflineStore((s) => s.clearAll);

  const clearAllFiles = useCallback(() => {
    try {
      const dir = getCacheDir();
      if (dir.exists) dir.delete();
    } catch {}
    clearAll();
  }, [clearAll]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    offlineBooks: Object.values(books).filter((b) => b.status === 'completed'),
    totalSize,
    formattedSize: formatSize(totalSize),
    clearExpired,
    clearAll: clearAllFiles,
  };
}
