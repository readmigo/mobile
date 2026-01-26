export const colors = {
  // Primary colors
  primary: '#2D5A7B',
  primaryLight: '#4A7A9B',
  primaryDark: '#1A3A5B',

  // Secondary colors
  secondary: '#7B4A2D',
  secondaryLight: '#9B6A4A',
  secondaryDark: '#5B3A1A',

  // Accent colors
  accent: '#4A9B7B',
  accentLight: '#6ABB9B',
  accentDark: '#2A7B5B',

  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
} as const;

export const lightTheme = {
  // Backgrounds
  background: colors.white,
  backgroundSecondary: colors.gray100,
  surface: colors.white,
  surfaceSecondary: colors.gray50,

  // Text colors
  text: colors.gray900,
  textSecondary: colors.gray600,
  textTertiary: colors.gray500,
  textInverse: colors.white,

  // Border colors
  border: colors.gray300,
  borderLight: colors.gray200,

  // Primary colors
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  onPrimary: colors.white,

  // Status colors
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.3)',
};

export const darkTheme = {
  // Backgrounds
  background: colors.gray900,
  backgroundSecondary: colors.gray800,
  surface: colors.gray800,
  surfaceSecondary: colors.gray700,

  // Text colors
  text: colors.white,
  textSecondary: colors.gray400,
  textTertiary: colors.gray500,
  textInverse: colors.gray900,

  // Border colors
  border: colors.gray700,
  borderLight: colors.gray600,

  // Primary colors
  primary: colors.primaryLight,
  primaryLight: colors.primary,
  onPrimary: colors.white,

  // Status colors
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,

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
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
  scrim: string;
}
