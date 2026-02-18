export const colors = {
  // Brand colors (aligned with iOS design spec)
  brandPrimary: '#7C8DF5',
  brandPrimaryDark: '#8B9BFF',
  brandGradientStart: '#8BB9FF',
  brandGradientMiddle: '#B9B3F5',
  brandGradientEnd: '#F6B6E8',

  // Accent colors
  accentPurple: '#9A8CF2',
  accentPink: '#F3A6DC',
  accentBlue: '#A5C7FF',
  achievementGold: '#FFD36A',

  // Semantic colors
  success: '#6ED6A8',
  warning: '#FFC26A',
  error: '#FF6B6B',
  info: '#7BAAFF',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#F7F8FD',
  gray100: '#EEF0FA',
  gray200: '#E0E0E0',
  gray300: '#D1D1D6',
  gray400: '#A3A6C8',
  gray500: '#6B6F9C',
  gray600: '#636366',
  gray700: '#3A3A3C',
  gray800: '#2C2C2E',
  gray900: '#1C1C1E',
} as const;

export const lightTheme = {
  // Backgrounds
  background: '#F7F8FD',
  backgroundSecondary: '#EEF0FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F7F8FD',

  // Text colors
  text: '#2D2E4A',
  textSecondary: '#6B6F9C',
  textTertiary: '#A3A6C8',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E0E0E0',
  borderLight: '#EEF0FA',

  // Primary colors
  primary: '#7C8DF5',
  primaryLight: '#8B9BFF',
  onPrimary: '#FFFFFF',

  // Brand gradient
  brandGradientStart: '#8BB9FF',
  brandGradientMiddle: '#B9B3F5',
  brandGradientEnd: '#F6B6E8',

  // Accent colors
  accentPurple: '#9A8CF2',
  accentPink: '#F3A6DC',
  accentBlue: '#A5C7FF',
  achievementGold: '#FFD36A',

  // Status colors
  success: '#6ED6A8',
  warning: '#FFC26A',
  error: '#FF6B6B',
  info: '#7BAAFF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.3)',
};

export const darkTheme = {
  // Backgrounds
  background: '#1C1C1E',
  backgroundSecondary: '#2C2C2E',
  surface: '#2C2C2E',
  surfaceSecondary: '#3A3A3C',

  // Text colors
  text: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textTertiary: '#636366',
  textInverse: '#1C1C1E',

  // Border colors
  border: '#3A3A3C',
  borderLight: '#2C2C2E',

  // Primary colors
  primary: '#8B9BFF',
  primaryLight: '#7C8DF5',
  onPrimary: '#FFFFFF',

  // Brand gradient
  brandGradientStart: '#7AABFF',
  brandGradientMiddle: '#A8A2E6',
  brandGradientEnd: '#E5A5D7',

  // Accent colors
  accentPurple: '#ABA0FF',
  accentPink: '#FF9ED4',
  accentBlue: '#8DB8FF',
  achievementGold: '#FFCC4D',

  // Status colors
  success: '#4AD98D',
  warning: '#FFB74D',
  error: '#FF5E5E',
  info: '#6B9AEF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',
};

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  onPrimary: string;
  brandGradientStart: string;
  brandGradientMiddle: string;
  brandGradientEnd: string;
  accentPurple: string;
  accentPink: string;
  accentBlue: string;
  achievementGold: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
  scrim: string;
}
