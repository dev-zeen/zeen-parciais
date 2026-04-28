import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { View } from '@/components/Themed';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { onGetFillLineupDefaultPlayers } from '@/components/contexts/team/_team.helpers';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';
import { PlayerStats } from '@/models/Stats';
import { useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';

type CupMatchTeamDetailsProps = {
  match: CupMatch;
  team: FullClubInfo;
  playerStats: PlayerStats;
};

export function CupMatchTeamDetails({ match, team, playerStats }: CupMatchTeamDetailsProps) {
  const colorTheme = useThemeColor();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { refetch: onRefetchStats, isRefetching: isRefetchingPlayerStats } =
    useGetScoredPlayers(isMarketClose);

  const {
    data: substitutions,
    isLoading: isInitialLoadingSubstitutions,
    refetch: onRefetchSubstitutions,
    isRefetching: isRefetchingSubstitutions,
  } = useGetMatchSubstitutions({
    id: team?.time.time_id,
    round: match.rodada_id,
  });

  const currentRound = useMemo(() => {
    if (!marketStatus) return 0;
    return isMarketClose ? marketStatus.rodada_atual : marketStatus.rodada_atual - 1;
  }, [isMarketClose, marketStatus]);

  const lineup = useMemo(() => {
    if (team && team.atletas && team.reservas)
      return onGetFillLineupDefaultPlayers({
        lineupStart: team.atletas,
        reserves: team.reservas,
        formationId:
          isMarketClose && currentRound === match.rodada_id
            ? team.time.esquema_id
            : (team.esquema_id ?? 1),
        playerStats,
        isMarketClose,
      });
  }, [currentRound, isMarketClose, match.rodada_id, playerStats, team]);

  const onRefetch = useCallback(
    () => Promise.all([onRefetchStats(), onRefetchSubstitutions()]),
    [onRefetchStats, onRefetchSubstitutions]
  );

  const isRefetching = isRefetchingPlayerStats || isRefetchingSubstitutions;

  if (isInitialLoadingSubstitutions || !lineup) {
    return <Loading />;
  }

  return (
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
          captain={team.capitao_id ?? 0}
          round={match.rodada_id}
          isViewOnly
          onOpenMarket={() => {}}
        />
        <ListReservePlayers
          lineup={lineup}
          substitutions={substitutions}
          round={match.rodada_id}
          isViewOnly
          onOpenMarket={() => {}}
        />
      </View>
    </ScrollView>
  );
}
