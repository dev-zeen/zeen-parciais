import { useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';

export default () => {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaViewContainer>
      <View className="items-center justify-center flex-1">
        <Text> Página do jogador {id} </Text>
      </View>
    </SafeAreaViewContainer>
  );
};
