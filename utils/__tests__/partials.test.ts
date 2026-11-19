import { describe, expect, it } from '@jest/globals';

import { FullPlayer, PlayerStats } from '@/models/Stats';
import { onCalculatePartialScore, onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

const fp = (atleta_id: number) => ({ atleta_id }) as FullPlayer;
const stats = (points: Record<number, number>) =>
  ({
    atletas: Object.fromEntries(
      Object.entries(points).map(([id, pontuacao]) => [id, { pontuacao }])
    ),
  }) as unknown as PlayerStats;

describe('onCalculatePartialScore', () => {
  it('soma quem pontuou e dá metade a mais ao capitão', () => {
    expect(onCalculatePartialScore([fp(1), fp(2), fp(3)], 2, stats({ 1: 4, 2: 10 }))).toBe(19);
  });

  it('é zero sem parciais', () => {
    expect(onCalculatePartialScore([fp(1)], 1, undefined)).toBe(0);
  });
});

describe('onUpdateTeamWithSubstitutedPlayers', () => {
  it('troca titular pelo reserva que entrou', () => {
    const club = { atletas: [fp(1), fp(2)], reservas: [fp(9)] } as never;
    const result = onUpdateTeamWithSubstitutedPlayers(club, [
      { entrou: fp(9), saiu: fp(2), posicao_id: 1 },
    ]);
    expect(result.playersUpdated.map((p) => p.atleta_id)).toEqual([1, 9]);
    expect(result.reservesUpdated.map((p) => p.atleta_id)).toEqual([2]);
  });
});
