import { apiClient, ApiResponse } from './client';
import {
  AgoraPost,
  AgoraPostsResponse,
  AgoraComment,
  GetPostsParams,
  CreateCommentDto,
} from '@/types/agora';

export const agoraApi = {
  getPosts: async (params?: GetPostsParams): Promise<AgoraPostsResponse> => {
    const response = await apiClient.get('/agora/posts', { params });
    return response.data;
  },

  getPostById: async (postId: string): Promise<ApiResponse<AgoraPost>> => {
    const response = await apiClient.get(`/agora/posts/${postId}`);
    return response.data;
  },

  likePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/agora/posts/${postId}/like`);
  },

  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/agora/posts/${postId}/like`);
  },

  createComment: async (
    postId: string,
    dto: CreateCommentDto
  ): Promise<ApiResponse<AgoraComment>> => {
    const response = await apiClient.post(`/agora/posts/${postId}/comments`, dto);
    return response.data;
  },

  likeComment: async (commentId: string): Promise<void> => {
    await apiClient.post(`/agora/comments/${commentId}/like`);
  },

  unlikeComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/agora/comments/${commentId}/like`);
  },

  sharePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/agora/posts/${postId}/share`);
  },

  hidePost: async (postId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/agora/posts/${postId}/hide`, { reason });
  },

  reportPost: async (postId: string, reason: string): Promise<void> => {
    await apiClient.post(`/agora/posts/${postId}/report`, { reason });
  },
};
