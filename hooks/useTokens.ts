import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { field, fontSize, lineHeight, palette, radius, spacing } from '@/styles/tokens';

/** Alvo mínimo de toque: 44pt no iOS (HIG), 48dp no Android (Material). */
export const MIN_TOUCH = Platform.OS === 'android' ? 48 : 44;

export function useTokens() {
  const scheme = useThemeColor();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      colors: palette[theme],
      field,
      spacing,
      radius,
      fontSize,
      lineHeight,
      minTouch: MIN_TOUCH,
    }),
    [theme]
  );
}

export type Tokens = ReturnType<typeof useTokens>;
