import { ActivityIndicator } from 'react-native';

import { View } from '@/components/Themed';

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center mx-2 rounded-lg">
      <ActivityIndicator />
    </View>
  );
}
