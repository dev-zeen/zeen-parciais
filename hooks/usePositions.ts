import { useGetPositions } from '@/queries/players.query';

const usePositions = () => {
  const {
    data: positions,
    isLoading: isLoadingPositions,
    refetch: onRefetchPositions,
    isRefetching: isRefetchingPositions,
  } = useGetPositions();

  return {
    positions,
    isLoadingPositions,
    onRefetchPositions,
    isRefetchingPositions,
  };
};

export default usePositions;
