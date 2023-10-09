import { useCallback, useContext, useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { onGetDefaultLineupTeam, onGetFillLineupDefaultPlayers } from './team.helpers';

import { View } from '@/components/Themed';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { TeamActions } from '@/components/contexts/team/TeamActions';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers } from '@/models/Formations';
import { useGetMatchSubstitutions, useGetMyClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, allowRequest, isMarketClose } = useMarketStatus();

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefetchPlayerStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const {
    data: myClub,
    isRefetching: isRefetchingMyClub,
    refetch: onRefetchMyClub,
  } = useGetMyClub(allowRequest);

  const { data: substitutions, isInitialLoading: isInitialLoadingSubstitutions } =
    useGetMatchSubstitutions({
      id: myClub?.time.time_id,
    });

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);
  const captain = useTeamLineupStore((state) => state.captain);

  const initialLineupTeamFormation = useMemo(
    () => onGetDefaultLineupTeam(myClub?.time.esquema_id as number),
    [myClub]
  );

  const isRefetching = useMemo(
    () => isRefetchingPlayerStats || isRefetchingMyClub,
    [isRefetchingMyClub, isRefetchingPlayerStats]
  );

  const mountLineup = useCallback(
    (myTeam: FullClubInfo) => {
      const defaultLineup = onGetFillLineupDefaultPlayers({
        lineupStart: myTeam.atletas,
        reserves: myTeam.reservas,
        formationId: myTeam.time.esquema_id,
        playerStats,
        isMarketClose,
      });

      return defaultLineup;
    },
    [isMarketClose, playerStats]
  );

  useEffect(() => {
    if (!lineup && myClub && !isRefetching) {
      const defaultLineup = mountLineup(myClub);
      updateLineup(defaultLineup as LineupPlayers);
      updateCaptain(myClub.capitao_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, isRefetching, myClub, playerStats]);

  const onRefresh = useCallback(() => {
    Promise.all([onRefetchPlayerStats(), onRefetchMyClub()]).then(([_, { data: myTeamData }]) => {
      const defaultLineup = mountLineup(myTeamData as FullClubInfo);
      updateLineup(defaultLineup);
      updateCaptain(myTeamData?.capitao_id as number);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, onRefetchMyClub, onRefetchPlayerStats, playerStats]);

  if (!isAutheticated) {
    return <Login title="Para acessar o seu time, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (
    !myClub ||
    !lineup ||
    isInitialLoadingSubstitutions ||
    isLoadingPlayerStats ||
    !marketStatus
  ) {
    return <Loading title="Carregando meu time" />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} />}>
        <View
          className={`justify-center items-center pb-2 ${
            colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
          }`}
          style={{ gap: 8 }}>
          <TeamActions initialLineupTeamFormation={initialLineupTeamFormation} />

          <SoccerField
            lineup={lineup}
            captain={captain}
            substitutions={substitutions}
            round={marketStatus?.rodada_atual}
            isViewOnly={isMarketClose}
          />

          <ListReservePlayers
            lineup={lineup}
            substitutions={substitutions}
            round={marketStatus?.rodada_atual}
            isViewOnly={isMarketClose}
          />
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};
