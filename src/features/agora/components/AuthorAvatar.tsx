import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AgoraAuthor } from '@/types/agora';

interface AuthorAvatarProps {
  author: AgoraAuthor;
  size?: 'small' | 'medium' | 'large';
  showEra?: boolean;
}

const SIZES = {
  small: 32,
  medium: 44,
  large: 56,
};

function AuthorAvatarComponent({ author, size = 'medium', showEra = true }: AuthorAvatarProps) {
  const { colors } = useTheme();
  const avatarSize = SIZES[size];

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {author.avatarUrl ? (
        <Image
          source={{ uri: author.avatarUrl }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: avatarSize * 0.4,
                color: colors.onPrimary,
              },
            ]}
          >
            {getInitials(author.name)}
          </Text>
        </View>
      )}
      {showEra && author.era && (
        <View
          style={[
            styles.eraBadge,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.eraText, { color: colors.textSecondary }]} numberOfLines={1}>
            {author.era}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  eraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    maxWidth: 60,
  },
  eraText: {
    fontSize: 8,
    fontWeight: '500',
  },
});

export const AuthorAvatar = memo(AuthorAvatarComponent);
