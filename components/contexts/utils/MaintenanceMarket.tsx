import { Image, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import maintenanceImage from '@/assets/images/manutencao.png';
import { View } from '@/components/Themed';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { useGetMarketStatus } from '@/queries/market.query';

type MaintenanceMarketProps = {
  hasHeader?: boolean;
};

export function MaintenanceMarket({ hasHeader }: MaintenanceMarketProps) {
  const { refetch, isRefetching } = useGetMarketStatus();

  return (
    <SafeAreaViewContainer edges={hasHeader ? [] : ['top']}>
      <MarketStatusCard />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}>
        <View
          className="flex-1 items-center justify-center p-6"
          style={{ gap: 16, backgroundColor: 'transparent' }}>
          <Image
            source={maintenanceImage}
            alt="Mercado em manutenção"
            style={{ height: 300, width: 300, resizeMode: 'contain' }}
          />
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
}
