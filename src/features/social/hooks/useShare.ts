import { useMutation } from '@tanstack/react-query';
import {
  shareBook,
  shareQuote,
  shareInvite,
  BookShareContent,
} from '../services/shareService';
import { useAuthStore } from '@/stores/authStore';

export function useShareBook() {
  return useMutation({
    mutationFn: (content: BookShareContent) => shareBook(content),
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
