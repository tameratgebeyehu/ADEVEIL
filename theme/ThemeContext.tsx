import React, { createContext, useCallback, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { THEME_PALETTES } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useAccessibilityStore, FONT_SCALE_MAP } from '@/store/accessibilityStore';
import type { ThemeColors, ThemeMode } from '@/types/vault.types';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (t: ThemeMode) => void;
  /** Numeric font scale multiplier derived from accessibility fontSize setting */
  fontScale: number;
  /** When true, apply stronger text/background contrast */
  highContrast: boolean;
  /** When true, skip heavy animations and LayoutAnimation calls */
  reduceMotion: boolean;
  // Legacy helpers kept for backward compatibility
  toggleTheme: () => void;
  autoClear: boolean;
  toggleAutoClear: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  colors: THEME_PALETTES.dark,
  isDark: true,
  setTheme: () => {},
  fontScale: 1.0,
  highContrast: false,
  reduceMotion: false,
  toggleTheme: () => {},
  autoClear: true,
  toggleAutoClear: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const {
    theme,
    setTheme: storeSetTheme,
    autoClearClipboard,
    setAutoClearClipboard,
  } = useSettingsStore();

  const { fontSize, highContrast, reduceMotion } = useAccessibilityStore();

  const baseColors = THEME_PALETTES[theme];
  const fontScale = FONT_SCALE_MAP[fontSize] ?? 1.0;

  // High contrast overrides — strengthen text and background contrast
  const colors: ThemeColors = highContrast
    ? {
        ...baseColors,
        text: baseColors.isDark ? '#FFFFFF' : '#000000',
        textMuted: baseColors.isDark ? '#E5E7EB' : '#111827',
        textDim: baseColors.isDark ? '#D1D5DB' : '#374151',
        bg: baseColors.isDark ? '#000000' : '#FFFFFF',
        surface: baseColors.isDark ? '#111111' : '#F0F0F0',
        border: baseColors.isDark ? '#555555' : '#888888',
      }
    : baseColors;

  const isDark = colors.isDark;

  const toggleTheme = useCallback(() => {
    storeSetTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, storeSetTheme]);

  const toggleAutoClear = useCallback(() => {
    setAutoClearClipboard(!autoClearClipboard);
  }, [autoClearClipboard, setAutoClearClipboard]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        isDark,
        setTheme: storeSetTheme,
        fontScale,
        highContrast,
        reduceMotion,
        toggleTheme,
        autoClear: autoClearClipboard,
        toggleAutoClear,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
