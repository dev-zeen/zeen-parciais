import { useTheme } from '@/contexts/Theme.context';

/**
 * Custom hook that returns the current color scheme (light or dark)
 * based on user's theme preference or system theme if set to auto
 * 
 * Use this instead of React Native's useColorScheme() to respect
 * user's manual theme selection
 */
export function useThemeColor() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
