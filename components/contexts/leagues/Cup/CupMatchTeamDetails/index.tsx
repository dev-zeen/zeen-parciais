import { useCallback, useMemo } from 'react';
import { ListRenderItemInfo, RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { onGetFillLineupDefaultPlayers } from '@/app/(tabs)/team/team.helpers';
import { View } from '@/components/Themed';
import { ClubPlayerCard } from '@/components/contexts/leagues/club/ClubPlayerCard';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { FullPlayer, PlayerStats } from '@/models/Stats';
import { useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

type CupMatchTeamDetailsProps = {
  match: CupMatch;
  team: FullClubInfo;
  playerStats: PlayerStats;
};

export function CupMatchTeamDetails({ match, team, playerStats }: CupMatchTeamDetailsProps) {
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { refetch: onRefetchStats, isRefetching: isRefetchingPlayerStats } =
    useGetScoredPlayers(isMarketClose);

  const {
    data: substitutions,
    isInitialLoading: isInitialLoadingSubstitutions,
    refetch: onRefetchSubstitutions,
    isRefetching: isRefetchingSubstitutions,
  } = useGetMatchSubstitutions({
    id: team?.time.time_id,
    round: match.rodada_id,
  });

  const lineup = useMemo(() => {
    if (team)
      return onGetFillLineupDefaultPlayers({
        lineupStart: team.atletas,
        reserves: team.reservas,
        formationId: team.time.esquema_id,
        playerStats,
        isMarketClose,
      });
  }, [isMarketClose, playerStats, team]);

  const onRefetch = useCallback(
    () => Promise.all([onRefetchStats(), onRefetchSubstitutions()]),
    [onRefetchStats, onRefetchSubstitutions]
  );

  const isRefetching = useMemo(
    () => isRefetchingPlayerStats || isRefetchingSubstitutions,
    [isRefetchingPlayerStats, isRefetchingSubstitutions]
  );

  const onGetPlayersTab = (team: FullClubInfo) => {
    const { playersUpdated, reservesUpdated } = onUpdateTeamWithSubstitutedPlayers(
      team,
      substitutions
    );

    return [
      {
        title: 'Titulares',
        data: playersUpdated as FullPlayer[],
      },
      {
        title: 'Reservas',
        data: reservesUpdated as FullPlayer[],
      },
    ];
  };

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <ClubPlayerCard
          key={player.atleta_id}
          player={player}
          isCaptain={team?.capitao_id === player.atleta_id}
          currentRound={match.rodada_id}
          marketStatus={marketStatus as MarketStatus}
          isReplacePlayer={substitutions?.some(
            (item) =>
              item.entrou.atleta_id === player.atleta_id || item.saiu.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [marketStatus, match.rodada_id, substitutions, team?.capitao_id]
  );

  const keyExtractor = useCallback((item: FullPlayer) => `${item.atleta_id}`, []);

  if (isInitialLoadingSubstitutions || !lineup) {
    return <Loading />;
  }

  return (
    // <SectionList
    //   refreshControl={
    //     <RefreshControl onRefresh={onRefetchStats} refreshing={isRefetchingPlayerStats} />
    //   }
    //   sections={onGetPlayersTab(team as FullClubInfo)}
    //   ListEmptyComponent={() => <Text>Sem dados para mostrar</Text>}
    //   keyExtractor={keyExtractor}
    //   renderItem={renderItem}
    //   showsVerticalScrollIndicator={false}
    //   stickyHeaderHiddenOnScroll
    //   contentContainerStyle={{
    //     paddingHorizontal: 8,
    //     gap: 8,
    //     backgroundColor:
    //       colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
    //   }}
    //   renderSectionHeader={({ section: { title } }) => (
    //     <View
    //       className="p-2 mx-2 rounded"
    //       style={{
    //         backgroundColor:
    //           colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
    //       }}>
    //       <Text className="font-bold text-base text-center items-center">{title}</Text>
    //     </View>
    //   )}
    // />

    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}>
      <View
        className="items-center justify-center pt-2 pb-2 mb-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <SoccerField
          lineup={lineup}
          substitutions={substitutions}
          captain={team.capitao_id}
          round={match.rodada_id}
          isViewOnly
        />
        <ListReservePlayers
          lineup={lineup}
          substitutions={substitutions}
          round={match.rodada_id}
          isViewOnly
        />
      </View>
    </ScrollView>
  );
}
