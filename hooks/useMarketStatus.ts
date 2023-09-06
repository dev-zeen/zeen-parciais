import { useGetMarketStatus } from '@/queries/market.query';

const useMarketStatus = () => {
  const {
    data: marketStatus,
    isLoading: isLoadingMarketStatus,
    refetch: onRefetchMarketStatus,
    isRefetching: isRefetchingMarketStatus,
  } = useGetMarketStatus();

  return {
    marketStatus,
    isLoadingMarketStatus,
    onRefetchMarketStatus,
    isRefetchingMarketStatus,
  };
};

export default useMarketStatus;
