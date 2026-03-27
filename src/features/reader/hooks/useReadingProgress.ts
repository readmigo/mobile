import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, ReadingProgress } from '@/services/api/books';
import { queryKeys } from '@/services/queryClient';

const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds

interface UseReadingProgressOptions {
  bookId: string | undefined;
  enabled?: boolean;
}

export function useReadingProgress({ bookId, enabled = true }: UseReadingProgressOptions) {
  const queryClient = useQueryClient();
  const latestRef = useRef<{ cfi: string; progress: number } | null>(null);
  const lastSavedRef = useRef<string | null>(null); // last saved CFI to avoid duplicate saves

  const { mutate: saveProgress } = useMutation({
    mutationFn: (data: ReadingProgress) => booksApi.updateReadingProgress(data),
    onSuccess: () => {
      // Invalidate library queries so Library tab shows updated progress
      queryClient.invalidateQueries({ queryKey: queryKeys.library.books });
    },
  });

  const flush = useCallback(() => {
    if (!bookId || !latestRef.current) return;
    if (latestRef.current.cfi === lastSavedRef.current) return; // no change

    const { cfi, progress } = latestRef.current;
    lastSavedRef.current = cfi;
    saveProgress({ bookId, cfi, progress: progress / 100 });
  }, [bookId, saveProgress]);

  // Called by reader on every location change
  const updateLocation = useCallback((cfi: string, progress: number) => {
    latestRef.current = { cfi, progress };
  }, []);

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !bookId) return;

    const interval = setInterval(flush, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, bookId, flush]);

  // Save on app background
  useEffect(() => {
    if (!enabled || !bookId) return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        flush();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [enabled, bookId, flush]);

  // Save on unmount (reader close)
  useEffect(() => {
    if (!enabled || !bookId) return;
    return () => { flush(); };
  }, [enabled, bookId, flush]);

  return { updateLocation, flush };
}
