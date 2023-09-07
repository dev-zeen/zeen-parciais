import { useGetMarket } from '@/queries/market.query';

const useMarket = () => {
  const {
    data: market,
    isLoading: isLoadingMarket,
    refetch: onRefetchMarket,
    isRefetching: isRefetchingMarket,
  } = useGetMarket();

  return {
    market,
    isLoadingMarket,
    onRefetchMarket,
    isRefetchingMarket,
  };
};

export default useMarket;
