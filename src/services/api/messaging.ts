import { apiClient, ApiResponse } from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const messagingApi = {
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const response = await apiClient.get('/messaging/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<ApiResponse<ChatMessage[]>> => {
    const response = await apiClient.get(`/messaging/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    const response = await apiClient.post(`/messaging/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  createConversation: async (subject: string, message: string): Promise<ApiResponse<Conversation>> => {
    const response = await apiClient.post('/messaging/conversations', { subject, message });
    return response.data;
  },
};
