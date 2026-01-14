import { ActivityIndicator, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';

type LoadingScreenProps = {
  title?: string;
};

export function LoadingScreen({ title }: LoadingScreenProps) {
  const colorTheme = useColorScheme();

  return (
    <SafeAreaViewContainer>
      <View
        className={`flex-1 items-center justify-center ${
          colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
        }`}
        style={{
          gap: 8,
        }}>
        <ActivityIndicator size="large" />
        {title && <Text className="font-medium text-sm">{title}</Text>}
      </View>
    </SafeAreaViewContainer>
  );
}
