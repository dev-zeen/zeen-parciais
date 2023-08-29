import { Feather } from '@expo/vector-icons';
import { Image } from 'react-native';

import emptyLeaguesImage from '@/assets/images/no-leagues.png';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export function EmptyLeagueList() {
  return (
    <View className="flex-1 justify-center items-center mx-2">
      <Image
        source={emptyLeaguesImage}
        className="w-72 h-72 rounded-full"
        alt={`Imagem de erro na aplicação`}
      />

      <View
        className="mx-8 items-center justify-center"
        style={{
          gap: 16,
        }}>
        <Feather name="alert-triangle" size={24} color={Colors.light.tint} />

        <Text className="text-center font-semibold text-base">
          Cartoleiro, você ainda não está participando de nenhuma liga
        </Text>
      </View>
    </View>
  );
}
