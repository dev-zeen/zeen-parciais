import { ActivityIndicator, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';

type LoadingProps = {
  title?: string;
};

export function Loading({ title }: LoadingProps) {
  const colorTheme = useColorScheme();

  return (
    <View
      className={`flex-1 items-center justify-center ${
        colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
      }`}
      style={{
        gap: 8,
      }}>
      <ActivityIndicator />
      {title && <Text className="font-medium text-sm">{title}</Text>}
    </View>
  );
}
