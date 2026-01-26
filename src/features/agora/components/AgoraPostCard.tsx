import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { AgoraPost } from '@/types/agora';
import { AuthorAvatar } from './AuthorAvatar';
import { BookReference } from './BookReference';
import { useLikePost, useSharePost } from '../hooks/useAgora';

interface AgoraPostCardProps {
  post: AgoraPost;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear}y`;
  if (diffMonth > 0) return `${diffMonth}mo`;
  if (diffWeek > 0) return `${diffWeek}w`;
  if (diffDay > 0) return `${diffDay}d`;
  if (diffHour > 0) return `${diffHour}h`;
  if (diffMin > 0) return `${diffMin}m`;
  return 'now';
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function AgoraPostCardComponent({ post }: AgoraPostCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const likePost = useLikePost();
  const sharePost = useSharePost();

  const handleLike = () => {
    likePost.mutate({ postId: post.id, isLiked: post.isLiked });
  };

  const handleShare = async () => {
    try {
      const content = post.postType === 'AUTHOR' && post.quote
        ? `"${post.quote.text}" - ${post.author?.name}`
        : post.content || '';

      await Share.share({
        message: content,
      });
      sharePost.mutate(post.id);
    } catch {
      // User cancelled
    }
  };

  const timeAgo = useMemo(() => formatTimeAgo(post.simulatedPostTime), [post.simulatedPostTime]);

  // Render author post
  if (post.postType === 'AUTHOR' && post.author && post.quote) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <AuthorAvatar author={post.author} size="medium" />
          <View style={styles.headerInfo}>
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {post.author.name}
            </Text>
            {post.author.nationality && (
              <Text style={[styles.authorMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                {post.author.nationality}
              </Text>
            )}
          </View>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo}</Text>
        </View>

        {/* Quote content */}
        <View style={styles.content}>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            {post.quote.text}
          </Text>
          {post.quote.textEn && (
            <Text style={[styles.quoteTextEn, { color: colors.textSecondary }]}>
              {post.quote.textEn}
            </Text>
          )}
        </View>

        {/* Book reference */}
        {post.quote.bookTitle && (
          <View style={styles.bookSection}>
            <BookReference
              bookId={post.quote.bookId}
              bookTitle={post.quote.bookTitle}
            />
          </View>
        )}

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: colors.borderLight }]}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleLike}
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={post.isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatCount(post.likeCount)}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatCount(post.commentCount)}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatCount(post.shareCount)}
            </Text>
          </Pressable>
        </View>

        {/* Comments preview */}
        {post.comments.length > 0 && (
          <View style={[styles.commentsPreview, { borderTopColor: colors.borderLight }]}>
            {post.comments.slice(0, 2).map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={[styles.commentUser, { color: colors.text }]}>
                  {comment.userName}
                </Text>
                <Text style={[styles.commentText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {comment.content}
                </Text>
              </View>
            ))}
            {post.commentCount > 2 && (
              <Pressable>
                <Text style={[styles.viewAllComments, { color: colors.primary }]}>
                  {t('agora.viewAllComments', { count: post.commentCount })}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  }

  // Render user post (future feature)
  return null;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
  },
  quoteTextEn: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bookSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  commentsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  commentText: {
    fontSize: 13,
    flex: 1,
  },
  viewAllComments: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});

export const AgoraPostCard = memo(AgoraPostCardComponent);
