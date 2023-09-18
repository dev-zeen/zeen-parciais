import { Image, useColorScheme } from 'react-native';

import maintenanceImage from '@/assets/images/manutencao.png';
import { Text, View } from '@/components/Themed';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';

export function MaintenanceMarket() {
  const colorTheme = useColorScheme();
  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2 rounded-lg"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <MarketStatusCard />

        <View
          className="items-center justify-center p-4 rounded-lg"
          style={{
            gap: 16,
          }}>
          <Text className="font-semibold text-sm">Mercado em Manutenção</Text>
          <Image
            source={maintenanceImage}
            alt="Mercado em manutenção"
            width={40}
            height={40}
            style={{
              height: 200,
              width: 200,
            }}
          />
        </View>
      </View>
    </SafeAreaViewContainer>
  );
}
