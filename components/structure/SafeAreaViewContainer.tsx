import { ReactNode } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, useColorScheme } from 'react-native';

type SafeAreaViewContainerProps = {
  children: ReactNode;
};

export function SafeAreaViewContainer({ children }: SafeAreaViewContainerProps) {
  const colorTheme = useColorScheme();

  return (
    <SafeAreaView
      className={`flex-1 rounded-lg ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}
      style={styles.container}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight && StatusBar.currentHeight + 8 : 0,
  },
});
