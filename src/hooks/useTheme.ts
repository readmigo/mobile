import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { useSettingsStore } from '@/stores/settingsStore';
import { createTheme, lightTheme, darkTheme, Theme } from '@/theme';

export function useTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const colors = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const navigationTheme: NavigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme : DefaultTheme).colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
    }),
    [isDark, colors]
  );

  return {
    theme,
    colors,
    isDark,
    navigationTheme,
  };
}

export type { Theme };
