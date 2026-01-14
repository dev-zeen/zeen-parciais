import { ReactNode } from 'react';
import { Platform, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

type SafeAreaViewContainerProps = {
  children: ReactNode;
  edges?: Edge[];
};

export function SafeAreaViewContainer({ children, edges }: SafeAreaViewContainerProps) {
  const colorTheme = useColorScheme();

  return (
    <SafeAreaView
      className={`flex-1 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
      style={styles.container}
      edges={edges}>
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
