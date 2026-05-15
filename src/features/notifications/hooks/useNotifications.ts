import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api/notifications';
import { handleApiError } from '@/services/api/errors';
import { notifyError } from '@/services/toast';

function onMutationError(err: unknown) {
  const appError = handleApiError(err);
  if (appError.isUserActionable) notifyError(appError);
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread'] as const,
};

export function useNotifications(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...notificationKeys.list, params],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(params);
      return response.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data.total;
    },
    refetchInterval: 60_000, // poll every 60s
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: onMutationError,
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: onMutationError,
  });
}
