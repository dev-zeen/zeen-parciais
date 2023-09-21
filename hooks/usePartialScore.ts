import { useCallback, useMemo } from 'react';

import useMarketStatus from '@/hooks/useMarketStatus';
import useValorization from '@/hooks/useValorization';
import { useGetClub, useGetMatchSubstitutions } from '@/queries/club.query';
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
  const { data: team } = useGetClub(teamId);
  const { isMarketClose } = useMarketStatus();
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  const { data: substitutions } = useGetMatchSubstitutions({ id: teamId });

  const { valorizations } = useValorization();

  const { playersUpdated } = useMemo(() => {
    if (team && isMarketClose) {
      return onUpdateTeamWithSubstitutedPlayers(team, substitutions);
    }
    return { playersUpdated: null };
  }, [team, isMarketClose, substitutions]);

  const newPartialScore = useMemo(() => {
    if (playersUpdated && playerStats) {
      return onCalculatePartialScore(playersUpdated, team?.capitao_id as number, playerStats);
    }
    return 0;
  }, [playersUpdated, team?.capitao_id, playerStats]);

  const onGetPartialValorization = useCallback(() => {
    const currentValorization = playersUpdated?.reduce((acc, current) => {
      if (valorizations?.atletas[current.atleta_id]?.variacao_num) {
        return (acc += valorizations?.atletas[current.atleta_id]?.variacao_num);
      }
      return acc;
    }, 0);

    return currentValorization;
  }, [playersUpdated, valorizations?.atletas]);

  const partialValorization = useMemo(() => onGetPartialValorization(), [onGetPartialValorization]);

  const playersHaveAlreadyPlayed = useMemo(() => {
    if (playersUpdated && playerStats) {
      return onGetPlayersHaveAlreadyPlayed(playersUpdated, playerStats);
    }
    return 0;
  }, [playersUpdated, playerStats]);

  const totalPartialScore = newPartialScore + (team?.pontos_campeonato ?? 0);

  const totalPartialValorization = useMemo(
    () => (partialValorization ?? 0) + (team?.patrimonio ?? 0),
    [partialValorization, team?.patrimonio]
  );

  if (!isMarketClose) {
    return {
      partialScore: 0,
      totalPartialScore: 0,
      partialValorization: 0,
      totalPartialValorization: 0,
      playersHaveAlreadyPlayed: 0,
    };
  }

  return {
    partialScore: newPartialScore,
    totalPartialScore,
    partialValorization,
    totalPartialValorization,
    playersHaveAlreadyPlayed,
  };
};

export default usePartialScore;
