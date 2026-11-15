import { useCallback } from 'react';

import { useGetMatchs } from '@/queries/matches.query';
import { useGetGatoMestreAtletas } from '@/queries/players.query';
import { buildPlayerInsight } from '@/utils/insights';

type InsightPlayer = Parameters<typeof buildPlayerInsight>[0];

/**
 * Junta Gato Mestre e partidas da rodada para responder, por jogador,
 * confronto, mando, médias casa/fora, mínimo para valorizar e scouts por jogo.
 * As duas consultas já são usadas no app; aqui só reaproveitamos o cache.
 */
export function usePlayerInsights() {
  const { data: gatoMestre, isLoading: isLoadingGatoMestre } = useGetGatoMestreAtletas();
  const { data: matches, isLoading: isLoadingMatches } = useGetMatchs();

  const getInsight = useCallback(
    (player: InsightPlayer) => buildPlayerInsight(player, gatoMestre, matches),
    [gatoMestre, matches]
  );

  return {
    getInsight,
    gatoMestre,
    matches,
    hasGatoMestre: !!gatoMestre,
    isLoading: isLoadingGatoMestre || isLoadingMatches,
  };
}
