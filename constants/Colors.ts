import { palette } from '@/styles/tokens';

/** Derivado de styles/tokens.ts; mantido para a navegação e para Themed.tsx. */
export default {
  light: {
    text: palette.light.text,
    background: palette.light.surface,
    backgroundFull: palette.light.bg,
    tint: palette.light.brand,
    tabIconDefault: palette.light.textMuted,
    tabIconSelected: palette.light.brand,
  },
  dark: {
    text: palette.dark.text,
    background: palette.dark.surface,
    backgroundFull: palette.dark.bg,
    tint: palette.dark.brand,
    tabIconDefault: palette.dark.textMuted,
    tabIconSelected: palette.dark.brand,
  },
};
