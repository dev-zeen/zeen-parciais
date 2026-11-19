import { describe, expect, it } from '@jest/globals';

import { buildSeasonStats } from '@/utils/profileStats';

const round = (rodada_id: number, pontos: number) => ({ rodada_id, pontos, patrimonio: 100 });

describe('buildSeasonStats', () => {
  it('ignora rodadas sem pontuação', () => {
    const stats = buildSeasonStats([round(1, 50), round(2, 0), round(3, 70)]);
    expect(stats.roundsPlayed).toBe(2);
    expect(stats.average).toBe(60);
    expect(stats.highest?.rodada_id).toBe(3);
    expect(stats.lowest?.rodada_id).toBe(1);
  });

  it('calcula o desvio padrão como consistência', () => {
    expect(buildSeasonStats([round(1, 50), round(2, 70)]).consistency).toBe(10);
  });

  it('consistência zero com uma rodada só', () => {
    expect(buildSeasonStats([round(1, 50)]).consistency).toBe(0);
  });

  it('rodada negativa conta como menor, mas não entra na média', () => {
    const stats = buildSeasonStats([round(1, 50), round(2, -3)]);
    expect(stats.lowest?.rodada_id).toBe(2);
    expect(stats.average).toBe(50);
    expect(stats.roundsPlayed).toBe(1);
  });

  it('vazio sem histórico', () => {
    expect(buildSeasonStats(undefined)).toEqual({ average: 0, consistency: 0, roundsPlayed: 0 });
  });
});
