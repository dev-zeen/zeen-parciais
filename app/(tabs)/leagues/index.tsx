import { useCallback, useContext } from 'react';
import { ListRenderItemInfo, RefreshControl, SectionList, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyLeagueList } from '@/components/contexts/leagues/EmptyLeagueList';
import { LeagueCard } from '@/components/contexts/leagues/LeagueCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useLeagues from '@/hooks/useLeagues';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import { LeagueUserDetails } from '@/models/Leagues';

export default function () {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus } = useMarketStatus();

  const { isRefetchingMyClub, onRefetchMyClub } = useMyClub();

  const { leagues, onRefetchLeagues, isRefetchingLeagues } = useLeagues();

  const keyExtractor = useCallback((item: LeagueUserDetails) => `${item.liga_id}`, []);

  const renderItem = useCallback(({ item: league }: ListRenderItemInfo<LeagueUserDetails>) => {
    return <LeagueCard key={league.liga_id} league={league} />;
  }, []);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchMyClub(), onRefetchLeagues()]);
  }, [onRefetchLeagues, onRefetchMyClub]);

  const isRefetching = isRefetchingMyClub || isRefetchingLeagues;

  if (!isAutheticated) {
    return <Login title="Para acessar suas ligas, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!leagues) {
    return <Loading />;
  }

  return (
    <SectionList
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
      sections={leagues}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      stickyHeaderHiddenOnScroll
      contentContainerStyle={{
        gap: 8,
        backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
      }}
      renderSectionHeader={({ section: { title } }) => (
        <View
          className="p-2 mx-2 rounded"
          style={{
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : '#F5F5F5',
          }}>
          <Text className="font-bold text-base text-center items-center">{title}</Text>
        </View>
      )}
      ListEmptyComponent={<EmptyLeagueList />}
    />
  );
}
