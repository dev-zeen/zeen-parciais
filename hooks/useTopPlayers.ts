import { useEffect, useState } from 'react';

import { useGetBestCaptainPlayers, useGetTopPlayers } from '@/queries/players.query';

const useTopPlayers = () => {
  const [hasHighlights, setHighlights] = useState(false);

  const { data: topPlayers, refetch: onRefetchTopPlayers } = useGetTopPlayers();

  const { data: bestPlayers, refetch: onRefetchBestPlayers } =
    useGetBestCaptainPlayers(hasHighlights);

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

export default useTopPlayers;
