import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

type ThemeContextProps = {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
};

const THEME_STORAGE_KEY = '@afc-parciais:theme';

export const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

export function ThemeContextProvider({ children }: { children: ReactNode }): ReactNode {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Determine the actual color scheme to use
  const colorScheme: ColorScheme =
    themeMode === 'auto'
      ? (systemColorScheme ?? 'light')
      : themeMode;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorScheme,
        setThemeMode,
        isLoading,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeContextProvider');
  }
  return context;
}
