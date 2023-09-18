import { useEffect, useMemo, useState } from 'react';

import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetMatchSubstitutions, useGetMyClub } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import {
  onCalculatePartialScore,
  onGetPlayersHaveAlreadyPlayed,
  onUpdateTeamWithSubstitutedPlayers,
} from '@/utils/partials';

type PartialScoreProps = {
  teamId: number;
};

const usePartialScore = ({ teamId }: PartialScoreProps) => {
  const { data: team } = useGetMyClub();

  const { isMarketClose } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const { data: substitutions } = useGetMatchSubstitutions({ id: teamId });

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
    partialScore: useMemo(() => partialScore, [partialScore]),
    playersHaveAlreadyPlayed: useMemo(() => playersHaveAlreadyPlayed, [playersHaveAlreadyPlayed]),
  };
};

export default usePartialScore;
