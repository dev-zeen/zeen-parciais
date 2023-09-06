import { useGetClub } from '@/queries/club.query';

type ClubProps = {
  teamId: number;
  round?: number;
};

const useTeam = ({ teamId, round }: ClubProps) => {
  const {
    data: team,
    isLoading: isLoadingTeam,
    refetch: onRefetchTeam,
    isRefetching: isRefetchingTeam,
  } = useGetClub(String(teamId), round);

  return {
    team,
    isLoadingTeam,
    onRefetchTeam,
    isRefetchingTeam,
  };
};

export default useTeam;
