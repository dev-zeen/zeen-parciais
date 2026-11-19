import { describe, expect, it } from '@jest/globals';

import { compareLineups } from '@/utils/rivals';

const p = (atleta_id: number, points: number) => ({ atleta_id, points });
const pointsOf = (player: { points: number }) => player.points;

describe('compareLineups', () => {
  const mine = [p(1, 10), p(2, 5), p(3, 8)];
  const theirs = [p(1, 10), p(4, 2), p(5, 12)];

  it('separa jogadores em comum e diferenciais, ordenados por pontos', () => {
    const result = compareLineups(mine, theirs, undefined, undefined, pointsOf);
    expect(result.common.map((x) => x.player.atleta_id)).toEqual([1]);
    expect(result.onlyMine.map((x) => x.player.atleta_id)).toEqual([3, 2]);
    expect(result.onlyTheirs.map((x) => x.player.atleta_id)).toEqual([5, 4]);
  });

  it('o saldo explica toda a diferença entre os times', () => {
    const result = compareLineups(mine, theirs, 3, 5, pointsOf);
    const myTotal = 10 + 5 + 8 + 8 * 0.5;
    const theirTotal = 10 + 2 + 12 + 12 * 0.5;
    expect(result.myCaptainBonus).toBe(4);
    expect(result.theirCaptainBonus).toBe(6);
    expect(result.balance).toBeCloseTo(myTotal - theirTotal);
  });

  it('mesmo capitão se anula', () => {
    const result = compareLineups(mine, theirs, 1, 1, pointsOf);
    expect(result.myCaptainBonus).toBe(result.theirCaptainBonus);
    expect(result.balance).toBe(5 + 8 - (2 + 12));
  });
});
