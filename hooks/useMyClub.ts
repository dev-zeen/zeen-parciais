import { useMemo } from 'react';

import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetHistoricMyClub, useGetMyClub } from '@/queries/club.query';

const useMyClub = () => {
  const { allowRequest } = useMarketStatus();

  const {
    data: historyClub,
    isLoading: isLoadingHistory,
    refetch: onRefetchHistoricMyClub,
    isRefetching: isRefetchingHistoricMyClub,
  } = useGetHistoricMyClub(!!allowRequest);

  const {
    data: myClub,
    isLoading: isLoadingMyClub,
    refetch: onRefetchMyClub,
    isRefetching: isRefetchingMyClub,
  } = useGetMyClub(!!allowRequest);

  const defaultCapitainClub =
    myClub && myClub.atletas.find((item) => item.atleta_id === myClub.capitao_id);

  return {
    myClub: useMemo(() => myClub, [myClub]),
    isLoadingMyClub: useMemo(() => isLoadingMyClub, [isLoadingMyClub]),
    onRefetchMyClub: useMemo(
      () => (!allowRequest ? null : onRefetchMyClub),
      [allowRequest, onRefetchMyClub]
    ),
    isRefetchingMyClub: useMemo(() => isRefetchingMyClub, [isRefetchingMyClub]),
    captain: defaultCapitainClub,

    historyClub: useMemo(() => historyClub, [historyClub]),
    isLoadingHistory: useMemo(() => isLoadingHistory, [isLoadingHistory]),
    onRefetchHistoricMyClub: useMemo(
      () => (!allowRequest ? null : onRefetchHistoricMyClub),
      [allowRequest, onRefetchHistoricMyClub]
    ),
    isRefetchingHistoricMyClub: useMemo(
      () => isRefetchingHistoricMyClub,
      [isRefetchingHistoricMyClub]
    ),
  };
};

export default useMyClub;
