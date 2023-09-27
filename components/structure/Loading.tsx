import { ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';

type LoadingProps = {
  title?: string;
};

export function Loading({ title }: LoadingProps) {
  return (
    <View
      className="flex-1 items-center justify-center mx-2 rounded-lg"
      style={{
        gap: 8,
      }}>
      <ActivityIndicator />
      <Text className="font-medium text-sm">{title ?? 'Carregando'}</Text>
    </View>
  );
}
