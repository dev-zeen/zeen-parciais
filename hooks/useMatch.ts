import { useGetMatchs } from '@/queries/matches.query';

const useMatch = () => {
  const {
    data: matches,
    isLoading: isLoadingMatches,
    refetch: onRefetchMatches,
    isRefetching: isRefetchingMatches,
  } = useGetMatchs();

  return {
    matches,
    isLoadingMatches,
    onRefetchMatches,
    isRefetchingMatches,
  };
};

export default useMatch;
