import { useMutation } from '@tanstack/react-query';
import {
  shareBook,
  shareQuote,
  shareInvite,
  BookShareContent,
} from '../services/shareService';
import { useAuthStore } from '@/stores/authStore';
import { handleApiError } from '@/services/api/errors';
import { notifyError } from '@/services/toast';

function onMutationError(err: unknown) {
  const appError = handleApiError(err);
  if (appError.isUserActionable) notifyError(appError);
}

export function useShareBook() {
  return useMutation({
    mutationFn: (content: BookShareContent) => shareBook(content),
    onError: onMutationError,
  });
}

export function useShareQuote() {
  return useMutation({
    mutationFn: ({ quote, bookTitle, author }: { quote: string; bookTitle: string; author: string }) =>
      shareQuote(quote, bookTitle, author),
    onError: onMutationError,
  });
}

export function useShareInvite() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => shareInvite(user?.id),
    onError: onMutationError,
  });
}
