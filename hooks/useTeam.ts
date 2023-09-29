import { useMemo } from 'react';

import { useGetClub } from '@/queries/club.query';

type ClubProps = {
  teamId: number;
  round?: number;
};

const useTeam = ({ teamId, round }: ClubProps) => {
  const {
    data: team,
    isInitialLoading: isLoadingTeam,
    refetch: onRefetchTeam,
    isRefetching: isRefetchingTeam,
  } = useGetClub(teamId, round);

  return {
    team: useMemo(() => team, [team]),
    isLoadingTeam: useMemo(() => isLoadingTeam, [isLoadingTeam]),
    onRefetchTeam,
    isRefetchingTeam: useMemo(() => isRefetchingTeam, [isRefetchingTeam]),
  };
};

export default useTeam;
