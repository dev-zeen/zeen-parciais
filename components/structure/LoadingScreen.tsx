import {  ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { useThemeColor } from '@/hooks/useThemeColor';

type LoadingScreenProps = {
  title?: string;
};

export function LoadingScreen({ title }: LoadingScreenProps) {
  const colorTheme = useThemeColor();

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className={`flex-1 items-center justify-center ${
          colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
        }`}
        style={{
          gap: 8,
        }}>
        <ActivityIndicator
          size="large"
          color="#FF8A00"
        />
        {title && (
          <Text 
            className="font-medium text-sm"
            style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
            {title}
          </Text>
        )}
      </View>
    </SafeAreaViewContainer>
  );
}
