/**
 * Image optimization utilities
 */

interface ImageSize {
  width: number;
  height: number;
}

/**
 * Generate optimized image URL with size parameters
 * Works with image CDNs that support query parameters for resizing
 */
export function getOptimizedImageUrl(
  url: string,
  size: ImageSize,
  options: { quality?: number; format?: 'webp' | 'jpeg' | 'png' } = {}
): string {
  if (!url) return url;

  const { quality = 80, format = 'webp' } = options;

  // Handle Cloudflare Images
  if (url.includes('imagedelivery.net')) {
    const baseUrl = url.split('/public')[0];
    return `${baseUrl}/w=${size.width},h=${size.height},q=${quality},f=${format}`;
  }

  // Handle Cloudinary
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${size.width},h_${size.height},q_${quality},f_${format}/${parts[1]}`;
    }
  }

  // Handle imgix
  if (url.includes('imgix.net')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${size.width}&h=${size.height}&q=${quality}&fm=${format}&fit=crop`;
  }

  // Return original URL if no CDN detected
  return url;
}

/**
 * Get thumbnail size based on device pixel ratio
 */
export function getThumbnailSize(
  baseWidth: number,
  baseHeight: number,
  pixelRatio: number = 2
): ImageSize {
  return {
    width: Math.round(baseWidth * Math.min(pixelRatio, 3)),
    height: Math.round(baseHeight * Math.min(pixelRatio, 3)),
  };
}

/**
 * Common image sizes for the app
 */
export const IMAGE_SIZES = {
  bookCoverSmall: { width: 80, height: 120 },
  bookCoverMedium: { width: 120, height: 180 },
  bookCoverLarge: { width: 200, height: 300 },
  avatar: { width: 100, height: 100 },
  avatarSmall: { width: 40, height: 40 },
  banner: { width: 400, height: 200 },
} as const;

/**
 * Preload images for better performance
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const { Image } = await import('expo-image');

  await Promise.allSettled(
    urls.map((url) => Image.prefetch(url))
  );
}

/**
 * Clear image cache
 */
export async function clearImageCache(): Promise<boolean> {
  try {
    const { Image } = await import('expo-image');
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    return true;
  } catch (error) {
    console.error('Failed to clear image cache:', error);
    return false;
  }
}
