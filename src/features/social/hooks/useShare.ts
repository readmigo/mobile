import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  shareBook,
  shareProgress,
  shareQuote,
  shareInvite,
  BookShareContent,
  ProgressShareContent,
} from '../services/shareService';
import { useLearningStore } from '@/features/learning';
import { useAuthStore } from '@/stores/authStore';

export function useShareBook() {
  return useMutation({
    mutationFn: (content: BookShareContent) => shareBook(content),
  });
}

export function useShareProgress() {
  const { todayProgress, currentStreak } = useLearningStore();

  const shareCurrentProgress = useCallback(async () => {
    const content: ProgressShareContent = {
      wordsLearned: todayProgress.wordsLearned,
      streak: currentStreak,
      booksRead: 0, // Would come from user stats
    };
    return shareProgress(content);
  }, [todayProgress, currentStreak]);

  return useMutation({
    mutationFn: shareCurrentProgress,
  });
}

export function useShareQuote() {
  return useMutation({
    mutationFn: ({ quote, bookTitle, author }: { quote: string; bookTitle: string; author: string }) =>
      shareQuote(quote, bookTitle, author),
  });
}

export function useShareInvite() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => shareInvite(user?.id),
  });
}
