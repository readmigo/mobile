import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agoraApi } from '@/services/api/agora';
import { GetPostsParams, CreateCommentDto } from '@/types/agora';

export const agoraKeys = {
  all: ['agora'] as const,
  posts: () => [...agoraKeys.all, 'posts'] as const,
  postsList: (params?: GetPostsParams) => [...agoraKeys.posts(), params] as const,
  post: (id: string) => [...agoraKeys.all, 'post', id] as const,
};

export function useAgoraPosts(params?: Omit<GetPostsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: agoraKeys.postsList(params),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await agoraApi.getPosts({ ...params, page: pageParam });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        await agoraApi.unlikePost(postId);
      } else {
        await agoraApi.likePost(postId);
      }
      return { postId, newIsLiked: !isLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agoraKeys.posts() });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, dto }: { postId: string; dto: CreateCommentDto }) => {
      return agoraApi.createComment(postId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agoraKeys.posts() });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (isLiked) {
        await agoraApi.unlikeComment(commentId);
      } else {
        await agoraApi.likeComment(commentId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agoraKeys.posts() });
    },
  });
}

export function useSharePost() {
  return useMutation({
    mutationFn: async (postId: string) => {
      await agoraApi.sharePost(postId);
    },
  });
}

export function useHidePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason?: string }) => {
      await agoraApi.hidePost(postId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agoraKeys.posts() });
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      await agoraApi.reportPost(postId, reason);
    },
  });
}
