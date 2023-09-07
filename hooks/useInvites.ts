import { useContext } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetInvites } from '@/queries/invites.query';

const useInvites = () => {
  const { marketStatus } = useMarketStatus();

  const { isAutheticated } = useContext(AuthContext);

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    data: invites,
    isLoading: isLoadingInvites,
    refetch: onRefetchInvites,
    isRefetching: isRefetchingInvites,
  } = useGetInvites(allowRequest);

  return {
    invites,
    isLoadingInvites,
    onRefetchInvites,
    isRefetchingInvites,
  };
};

export default useInvites;
