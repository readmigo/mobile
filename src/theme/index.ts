export * from './colors';
export * from './typography';
export * from './spacing';

import { lightTheme, darkTheme, ThemeColors } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, borderRadius, iconSize, Spacing, BorderRadius, IconSize } from './spacing';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
  isDark: boolean;
}

export const createTheme = (isDark: boolean): Theme => ({
  colors: isDark ? darkTheme : lightTheme,
  typography,
  spacing,
  borderRadius,
  iconSize,
  isDark,
});

export { lightTheme, darkTheme };
export type { ThemeColors, TypographyVariant, Spacing, BorderRadius, IconSize };
