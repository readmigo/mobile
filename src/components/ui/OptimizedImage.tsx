import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';
import { Image, ImageProps, ImageContentFit } from 'expo-image';

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: ImageStyle;
  width?: number;
  height?: number;
  contentFit?: ImageContentFit;
  placeholder?: string;
  transition?: number;
  priority?: 'low' | 'normal' | 'high';
  recyclingKey?: string;
}

// Blurhash placeholder for loading state
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

function OptimizedImageComponent({
  source,
  style,
  width,
  height,
  contentFit = 'cover',
  placeholder = DEFAULT_BLURHASH,
  transition = 200,
  priority = 'normal',
  recyclingKey,
}: OptimizedImageProps) {
  const uri = typeof source === 'string' ? source : source.uri;

  if (!uri) {
    return (
      <View
        style={[
          styles.placeholder,
          style as ViewStyle,
          width !== undefined && { width },
          height !== undefined && { height },
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[style, width !== undefined && { width }, height !== undefined && { height }]}
      contentFit={contentFit}
      placeholder={placeholder}
      transition={transition}
      priority={priority}
      recyclingKey={recyclingKey}
      cachePolicy="memory-disk"
    />
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e5e5e5',
  },
});
