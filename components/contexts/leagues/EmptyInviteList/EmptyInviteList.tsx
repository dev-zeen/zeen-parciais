import { Feather } from '@expo/vector-icons';
import {  Image } from 'react-native';

import noData from '@/assets/images/noData.png';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export function EmptyInviteList() {
  const colorTheme = useThemeColor();

  return (
    <View
      className={`flex-1 rounded-lg ${
        colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
      } items-center justify-center`}>
      <Image
        source={noData}
        className="w-72 h-72 rounded-full"
        alt={'Imagem de erro na aplicação'}
      />

      <View
        className="mx-8 items-center justify-center"
        style={{
          gap: 4,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <Feather name="alert-circle" size={24} color={Colors.light.tint} />

        <Text className="text-center font-semibold text-base">
          Cartoleiro, você ainda não possui convites
        </Text>
      </View>
    </View>
  );
}
