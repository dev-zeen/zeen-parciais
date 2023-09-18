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

  const capitain = myClub && myClub.atletas.find((item) => item.atleta_id === myClub.capitao_id);

  return {
    myClub,
    isLoadingMyClub,
    onRefetchMyClub: !allowRequest ? null : onRefetchMyClub,
    isRefetchingMyClub,
    capitain,

    historyClub,
    isLoadingHistory,
    onRefetchHistoricMyClub: !allowRequest ? null : onRefetchHistoricMyClub,
    isRefetchingHistoricMyClub,
  };
};

export default useMyClub;
