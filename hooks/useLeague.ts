import { useMemo } from 'react';

import useMarketStatus from '@/hooks/useMarketStatus';
import { TeamLeague } from '@/models/Leagues';
import { useGetClubsByLeagueId, useGetLeague } from '@/queries/leagues.query';

type UseLeagueProps = {
  slug: string;
};

export interface TeamCup extends TeamLeague {
  isPending?: boolean;
}

const useLeague = ({ slug }: UseLeagueProps) => {
  const { allowRequest } = useMarketStatus();

  const {
    data: league,
    isInitialLoading: isLoadingLeague,
    refetch: onRefetchLeague,
    isRefetching: isRefetchingLeague,
  } = useGetLeague(slug as string, allowRequest);

  const { data: clubsByLeague, isInitialLoading: isLoadingClubsByLeague } = useGetClubsByLeagueId(
    league?.liga.liga_id
  );

  const isCupInProgress = useMemo(() => {
    if (league && league?.chaves_mata_mata) {
      return Object.keys(league?.chaves_mata_mata).length > 0;
    }
  }, [league]);

  const totalTeamCup = useMemo(
    () => league?.liga.quantidade_times,
    [league?.liga.quantidade_times]
  );
  const currentTeamsCup = useMemo(
    () => league?.liga.total_times_liga,
    [league?.liga.total_times_liga]
  );

  const teamsAwatingAcceptInvite: TeamCup[] | undefined = useMemo(
    () => league?.convites_enviados?.map((item) => ({ ...item.time, isPending: true })),
    [league?.convites_enviados]
  );

  const teamsByCup: TeamCup[] | [] = useMemo(() => {
    if (league && league.times && league?.times.length > 0) {
      return league?.times?.map((item) => item).sort((a, b) => a.time_id - b.time_id);
    }
    return [];
  }, [league]);

  return {
    league,
    isLoadingLeague,
    onRefetchLeague,
    isRefetchingLeague,

    clubsByLeague,
    isLoadingClubsByLeague,

    isCupInProgress,
    totalTeamCup,
    currentTeamsCup,
    teamsAwatingAcceptInvite,
    teamsByCup,
  };
};

export default useLeague;
