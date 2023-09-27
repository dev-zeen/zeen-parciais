import { Feather } from '@expo/vector-icons';
import { Image, useColorScheme } from 'react-native';

import noData from '@/assets/images/noData.png';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

type EmptyDataProps = {
  title: string;
  subtitle: string;
};

export function EmptyData({ title, subtitle }: EmptyDataProps) {
  const colorTheme = useColorScheme();

  return (
    <View
      className={`flex-1 rounded-lg ${
        colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
      } items-center justify-center`}>
      <Image source={noData} className="w-72 h-72 rounded-full" alt="Imagem de erro na aplicação" />

      <View
        className="mx-8 items-center justify-center"
        style={{
          gap: 4,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <Feather name="alert-circle" size={24} color={Colors.light.tint} />
        <Text className="text-center font-semibold text-base">{title}</Text>
      </View>
    </View>
  );
}
