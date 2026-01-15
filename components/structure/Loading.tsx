import {  ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';

type LoadingProps = {
  title?: string;
};

export function Loading({ title }: LoadingProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      className={`flex-1 items-center justify-center ${
        colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
      }`}
      style={{
        gap: 8,
      }}>
      <ActivityIndicator 
        color={colorTheme === 'dark' ? '#60a5fa' : '#3b82f6'}
      />
      {title && (
        <Text 
          className="font-medium text-sm"
          style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
          {title}
        </Text>
      )}
    </View>
  );
}
