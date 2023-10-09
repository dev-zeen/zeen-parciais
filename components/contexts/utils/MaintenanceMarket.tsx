import { Image, ScrollView, useColorScheme } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import maintenanceImage from '@/assets/images/manutencao.png';
import { Text, View } from '@/components/Themed';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { useGetMarketStatus } from '@/queries/market.query';

type MaintenanceMarketProps = {
  hasHeader?: boolean;
};

export function MaintenanceMarket({ hasHeader }: MaintenanceMarketProps) {
  const colorTheme = useColorScheme();

  const { refetch, isRefetching } = useGetMarketStatus();

  return (
    <ScrollView refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}>
      {hasHeader ? (
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
      ) : (
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
      )}
    </ScrollView>
  );
}
