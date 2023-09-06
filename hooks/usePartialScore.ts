import { useEffect, useState } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useSubstituition from '@/hooks/useSubstituition';
import useTeam from '@/hooks/useTeam';
import {
  onCalculatePartialScore,
  onGetPlayersHaveAlreadyPlayed,
  onUpdateTeamWithSubstitutedPlayers,
} from '@/utils/partials';

type PartialScoreProps = {
  teamId: number;
};

const usePartialScore = ({ teamId }: PartialScoreProps) => {
  const { team } = useTeam({ teamId: teamId ?? '' });

  const { marketStatus } = useMarketStatus();

  const { playerStats } = usePlayerStats();

  const { substitutions } = useSubstituition({ teamId });

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const [partialScore, setPartialScore] = useState(0);
  const [playersHaveAlreadyPlayed, setPlayersHaveAlreadyPlayed] = useState(0);

  useEffect(() => {
    if (team && isMarketClose) {
      const { playersUpdated } = onUpdateTeamWithSubstitutedPlayers(team, substitutions);

      const newPartialScore = onCalculatePartialScore(
        playersUpdated,
        team.capitao_id as number,
        playerStats
      );

      setPartialScore(newPartialScore);

      if (playersUpdated && playerStats) {
        const countPlayersPlayed = onGetPlayersHaveAlreadyPlayed(playersUpdated, playerStats);

        setPlayersHaveAlreadyPlayed(countPlayersPlayed);
      }
    }
  }, [substitutions, playerStats, isMarketClose, team]);

  return {
    partialScore,
    playersHaveAlreadyPlayed,
  };
};

export default usePartialScore;
