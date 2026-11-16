import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

type ThemeContextProps = {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
};

const THEME_STORAGE_KEY = '@parciais-fc:theme';

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
        if (
          savedTheme &&
          (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')
        ) {
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

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  // Elementos nativos (barra de abas, sheets, teclado) seguem a aparência do sistema.
  // Repassar a escolha do app evita barra clara sobre tela escura (e vice-versa).
  useEffect(() => {
    if (isLoading) return;
    Appearance.setColorScheme(themeMode === 'auto' ? 'unspecified' : themeMode);
  }, [isLoading, themeMode]);

  const colorScheme: ColorScheme =
    themeMode === 'auto' ? (systemColorScheme ?? 'light') : themeMode;

  const contextValue = useMemo(
    () => ({ themeMode, colorScheme, setThemeMode, isLoading }),
    [themeMode, colorScheme, setThemeMode, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
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
