import { useContext, useEffect, useState } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetBestCaptainPlayers, useGetTopPlayers } from '@/queries/players.query';

const useTopPlayer = () => {
  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus } = useMarketStatus();

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const [hasHighlights, setHighlights] = useState(false);

  const { data: topPlayers, refetch: onRefetchTopPlayers } = useGetTopPlayers(allowRequest);

  const { data: bestPlayers, refetch: onRefetchBestPlayers } = useGetBestCaptainPlayers(
    hasHighlights,
    allowRequest
  );

  useEffect(() => {
    if (topPlayers && topPlayers?.length > 0) setHighlights(true);
  }, [topPlayers]);

  return {
    topPlayers,
    bestPlayers,
    onRefetchTopPlayers,
    onRefetchBestPlayers,
  };
};

export default useTopPlayer;
