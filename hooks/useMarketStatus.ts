import { useContext, useMemo } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { useGetMarketStatus } from '@/queries/market.query';

const useMarketStatus = () => {
  const { isAutheticated } = useContext(AuthContext);

  const {
    data: marketStatus,
    isLoading: isLoadingMarketStatus,
    refetch: onRefetchMarketStatus,
    isRefetching: isRefetchingMarketStatus,
  } = useGetMarketStatus();

  const isMarketClose = useMemo(
    () => marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO,
    [marketStatus?.status_mercado]
  );

  const allowRequest = useMemo(
    () =>
      isAutheticated &&
      marketStatus &&
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO,
    [isAutheticated, marketStatus]
  );

  return {
    marketStatus,
    isLoadingMarketStatus,
    onRefetchMarketStatus,
    isRefetchingMarketStatus,
    isMarketClose,
    allowRequest,
  };
};

export default useMarketStatus;
