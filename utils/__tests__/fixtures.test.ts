import { describe, expect, it } from '@jest/globals';

import { Matches } from '@/models/Matches';
import { buildFixtureTicker, difficultyOf, ranksFromMatches } from '@/utils/fixtures';

const match = (home: number, away: number, homeRank = 0, awayRank = 0) =>
  ({
    clube_casa_id: home,
    clube_visitante_id: away,
    clube_casa_posicao: homeRank,
    clube_visitante_posicao: awayRank,
  }) as Matches['partidas'][number];

const round = (rodada: number, partidas: Matches['partidas']) =>
  ({ rodada, partidas, clubes: {} }) as Matches;

describe('difficultyOf', () => {
  it.each([
    [1, 4],
    [5, 4],
    [6, 3],
    [11, 2],
    [16, 1],
    [20, 1],
  ])('posição %i → dificuldade %i', (rank, expected) => {
    expect(difficultyOf(rank)).toBe(expected);
  });

  it('sem posição não tem dificuldade', () => {
    expect(difficultyOf(undefined)).toBeUndefined();
    expect(difficultyOf(0)).toBeUndefined();
  });
});

describe('buildFixtureTicker', () => {
  // Clube 1 é líder, 2 é o 20º; 3 é 10º, 4 é 15º.
  const r1 = round(10, [match(1, 2, 1, 20), match(3, 4, 10, 15)]);
  const r2 = round(11, [match(2, 3), match(4, 1)]);

  it('ordena do calendário mais fácil para o mais difícil', () => {
    const rows = buildFixtureTicker([r1, r2], ranksFromMatches(r1));
    // Clube 1 enfrenta 20º e 15º (fácil); clube 2 enfrenta 1º e 10º (difícil).
    expect(rows[0]).toMatchObject({ clubId: 1, average: 1.5 });
    expect(rows.find((row) => row.clubId === 2)?.average).toBe(3.5);
    const averages = rows.map((row) => row.average ?? 5);
    expect(averages).toEqual([...averages].sort((a, b) => a - b));
  });

  it('marca mando e adversário de cada rodada', () => {
    const rows = buildFixtureTicker([r1, r2], ranksFromMatches(r1));
    const club4 = rows.find((row) => row.clubId === 4)!;
    expect(club4.fixtures).toEqual([
      { round: 10, opponentId: 3, isHome: false, difficulty: 3 },
      { round: 11, opponentId: 1, isHome: true, difficulty: 4 },
    ]);
  });

  it('rodada sem jogo fica null', () => {
    const r3 = round(12, [match(1, 2)]);
    const rows = buildFixtureTicker([r1, r3], ranksFromMatches(r1));
    expect(rows.find((row) => row.clubId === 3)!.fixtures[1]).toBeNull();
  });
});
