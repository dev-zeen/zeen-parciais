import { MARKET_STATUS_NAME } from '@/constants/Market';
import { useGetMarketStatus } from '@/queries/market.query';

const useMarketStatus = () => {
  const {
    data: marketStatus,
    isLoading: isLoadingMarketStatus,
    refetch: onRefetchMarketStatus,
    isRefetching: isRefetchingMarketStatus,
  } = useGetMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  return {
    marketStatus,
    isLoadingMarketStatus,
    onRefetchMarketStatus,
    isRefetchingMarketStatus,
    isMarketClose,
  };
};

export default useMarketStatus;
