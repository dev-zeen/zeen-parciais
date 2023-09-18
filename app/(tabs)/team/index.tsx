import { useCallback, useContext, useEffect, useMemo } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { onGetDefaultLineupTeam, onGetFillLineupDefaultPlayers } from './team.helpers';

import { View } from '@/components/Themed';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { TeamActions } from '@/components/contexts/team/TeamActions';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetMyClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, allowRequest, isMarketClose } = useMarketStatus();

  const {
    data: playerStats,
    refetch: onRefetchPlayerStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const { data: myClub } = useGetMyClub(allowRequest);

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const initialLineupTeamFormation = useMemo(
    () => onGetDefaultLineupTeam(myClub?.time.esquema_id as number),
    [myClub]
  );

  useEffect(() => {
    if (!lineup && myClub) {
      const defaultLineup = onGetFillLineupDefaultPlayers(myClub, playerStats, isMarketClose);

      updateLineup(defaultLineup);
      updateCapitain(myClub.capitao_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClub, playerStats]);

  const onRefresh = useCallback(async () => {
    await Promise.all([onRefetchPlayerStats]);
  }, [onRefetchPlayerStats]);

  const isRefetching = useMemo(() => isRefetchingPlayerStats, [isRefetchingPlayerStats]);

  if (!isAutheticated) {
    return <Login title="Para acessar o seu time, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!myClub || !lineup) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} />}>
        <View
          className={`justify-center items-center pb-2 ${
            colorTheme === 'dark' ? `bg-dark` : 'bg-light'
          }`}
          style={{ gap: 8 }}>
          <MarketStatusCard />

          <TeamActions initialLineupTeamFormation={initialLineupTeamFormation} />

          <SoccerField />

          <ListReservePlayers />
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
