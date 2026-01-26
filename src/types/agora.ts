// Agora (城邦) types - matching backend DTOs

export type PostType = 'AUTHOR' | 'USER';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface AgoraAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  era: string | null;
  nationality: string | null;
  bookCount: number;
}

export interface AgoraQuote {
  id: string;
  text: string;
  textEn: string | null;
  source: string;
  bookId: string | null;
  bookTitle: string | null;
  author: string;
  chapter: string | null;
  tags: string[];
}

export interface AgoraUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface AgoraMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface AgoraComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  replyToId: string | null;
  replyToUserName: string | null;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface AgoraPost {
  id: string;
  postType: PostType;
  // Author post fields
  author?: AgoraAuthor;
  quote?: AgoraQuote;
  // User post fields
  user?: AgoraUser;
  content?: string;
  media?: AgoraMedia[];
  // Common fields
  simulatedPostTime: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: AgoraComment[];
}

export interface AgoraPostsResponse {
  data: AgoraPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  authorId?: string;
  tag?: string;
}

export interface CreateCommentDto {
  content: string;
  replyTo?: string;
}
