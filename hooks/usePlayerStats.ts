import { useEffect, useState } from 'react';

import { CURRENT_STATS } from '@/constants/Keys';
import useMarketStatus from '@/hooks/useMarketStatus';
import { PlayerStats } from '@/models/Stats';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onGetFromStorage } from '@/utils/asyncStorage';

const usePlayerStats = () => {
  const { isMarketClose } = useMarketStatus();

  const [cachedStats, setCachedStats] = useState<PlayerStats>();
  const [isCacheLoading, setIsCacheLoading] = useState(true);

  useEffect(() => {
    onGetFromStorage<string>(CURRENT_STATS).then((res: string) => {
      if (res) setCachedStats(JSON.parse(res));
      setIsCacheLoading(false);
    });
  }, []);

  const {
    data: liveStats,
    isLoading: isLoadingQuery,
    refetch: onRefetchStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  return {
    playerStats: liveStats ?? cachedStats,
    isLoadingPlayerStats: isLoadingQuery && isCacheLoading,
    onRefetchStats,
    isRefetchingPlayerStats,
  };
};

export default usePlayerStats;
