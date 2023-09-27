import { useEffect, useMemo, useState } from 'react';

import { CURRENT_STATS } from '@/constants/Keys';
import useMarketStatus from '@/hooks/useMarketStatus';
import { PlayerStats } from '@/models/Stats';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onGetFromStorage } from '@/utils/asyncStorage';

const usePlayerStats = () => {
  const { isMarketClose } = useMarketStatus();

  const [currentStats, setCurrentStats] = useState<PlayerStats>();

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefetchStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onGetFromStorage<string>(CURRENT_STATS).then((res: string) => {
      const statsFormated: PlayerStats = JSON.parse(res);
      if (res) {
        setCurrentStats(statsFormated);
      }
      setIsLoading(false);
    });
  }, []);

  return {
    playerStats: useMemo(
      () => (isMarketClose ? playerStats : currentStats),
      [currentStats, isMarketClose, playerStats]
    ),
    isLoadingPlayerStats: useMemo(
      () => isLoadingPlayerStats || isLoading,
      [isLoading, isLoadingPlayerStats]
    ),
    onRefetchStats,
    isRefetchingPlayerStats: useMemo(() => isRefetchingPlayerStats, [isRefetchingPlayerStats]),
  };
};

export default usePlayerStats;
