import { useGetPositions } from '@/queries/players.query';

const usePosition = () => {
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

export default usePosition;
