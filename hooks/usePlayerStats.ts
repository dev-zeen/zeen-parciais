import { useEffect, useState } from 'react';

import { CURRENT_STATS } from '@/constants/Keys';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarket from '@/hooks/useMarket';
import useMarketStatus from '@/hooks/useMarketStatus';
import { PlayerStats } from '@/models/Stats';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onGetFromStorage } from '@/utils/asyncStorage';

const usePlayerStats = () => {
  const { market } = useMarket();
  const { marketStatus } = useMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const [currentStats, setCurrentStats] = useState<PlayerStats>();

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefetchStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  useEffect(() => {
    onGetFromStorage<string>(CURRENT_STATS).then((res: string) => {
      const statsFormated: PlayerStats = JSON.parse(res);
      if (res) {
        setCurrentStats(statsFormated);
      }
    });
  }, [isMarketClose, market, playerStats, setCurrentStats]);

  return {
    playerStats: isMarketClose ? playerStats : currentStats,
    isLoadingPlayerStats,
    onRefetchStats,
    isRefetchingPlayerStats,
  };
};

export default usePlayerStats;
