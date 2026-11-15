import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';

import Providers from './_providers';

import { AnimatedSplash } from '@/components/structure/AnimatedSplash';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Satoshi-Variable': require('../assets/fonts/Satoshi-Variable.ttf'),
    'Satoshi-VariableItalic': require('../assets/fonts/Satoshi-VariableItalic.ttf'),
    ...FontAwesome.font,
  });

  // O splash nativo fica até a splash animada montar; ela o esconde no primeiro layout.
  const [showSplash, setShowSplash] = useState(true);

  if (error) throw error;

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <RootLayoutNav />
      {showSplash ? <AnimatedSplash onFinish={() => setShowSplash(false)} /> : null}
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useThemeColor();

  return (
    <Providers>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar
          backgroundColor={
            colorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull
          }
        />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </Providers>
  );
}
