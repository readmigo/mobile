import { apiClient, ApiResponse } from './client';

export interface AppNotification {
  id: string;
  type: 'system' | 'reading_reminder' | 'new_book' | 'social' | 'achievement';
  title: string;
  body: string;
  isRead: boolean;
  deepLink?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface UnreadCount {
  total: number;
}

export const notificationsApi = {
  getNotifications: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<AppNotification[]>> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<UnreadCount>> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  registerPushToken: async (token: string, platform: string): Promise<void> => {
    await apiClient.post('/devices/push-token', { token, platform });
  },
};
