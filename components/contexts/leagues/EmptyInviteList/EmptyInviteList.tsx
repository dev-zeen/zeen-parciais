import { Feather } from '@expo/vector-icons';
import { Image, View as RNView, useColorScheme } from 'react-native';

import noData from '@/assets/images/noData.png';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export function EmptyInviteList() {
  const colorTheme = useColorScheme();

  return (
    <View
      className={`rounded-lg ${
        colorTheme === 'dark' ? `bg-dark` : 'bg-light'
      } items-center justify-center`}>
      <Image
        source={noData}
        className="w-72 h-72 rounded-full"
        alt={`Imagem de erro na aplicação`}
      />

      <RNView
        className="mx-8 items-center justify-center"
        style={{
          gap: 4,
        }}>
        <Feather name="alert-circle" size={24} color={Colors.light.tint} />

        <Text className="text-center font-semibold text-base">
          Cartoleiro, você ainda não possui convites
        </Text>
      </RNView>
    </View>
  );
}
