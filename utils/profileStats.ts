/**
 * Números da temporada do perfil a partir do histórico por rodada. Funções puras.
 * Maior e menor rodada consideram qualquer pontuação diferente de zero (inclusive negativa);
 * média, consistência e rodadas jogadas, só as positivas.
 */
import type { TeamHistoryRound } from '@/models/Club';

export type SeasonStats = {
  highest?: TeamHistoryRound;
  lowest?: TeamHistoryRound;
  average: number;
  /** Desvio padrão das pontuações (quanto menor, mais regular) */
  consistency: number;
  roundsPlayed: number;
};

export function buildSeasonStats(history?: TeamHistoryRound[]): SeasonStats {
  const scored = (history ?? []).filter((round) => !!round.pontos);
  const played = scored.filter((round) => round.pontos > 0);
  const extremes = scored.length
    ? {
        highest: scored.reduce((best, round) => (round.pontos > best.pontos ? round : best)),
        lowest: scored.reduce((worst, round) => (round.pontos < worst.pontos ? round : worst)),
      }
    : {};
  if (played.length === 0) {
    return { ...extremes, average: 0, consistency: 0, roundsPlayed: 0 };
  }

  const average = played.reduce((sum, round) => sum + round.pontos, 0) / played.length;
  const variance =
    played.reduce((sum, round) => sum + (round.pontos - average) ** 2, 0) / played.length;

  return {
    ...extremes,
    average,
    consistency: played.length < 2 ? 0 : Math.sqrt(variance),
    roundsPlayed: played.length,
  };
}
