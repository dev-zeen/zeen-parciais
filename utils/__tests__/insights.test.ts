import { describe, expect, it } from '@jest/globals';

import { PlayerInsight, buildLineupProjection, suggestCaptain } from '@/utils/insights';

const PROVAVEL = 7;
const DUVIDA = 2;

type P = { atleta_id: number; clube_id: number; status_id: number; media_num: number };
const player = (atleta_id: number, media_num: number, status_id = PROVAVEL, clube_id = 1): P => ({
  atleta_id,
  clube_id,
  status_id,
  media_num,
});

const withMatch = { match: {} } as Pick<PlayerInsight, 'match'>;
const insightFor =
  (overrides: Record<number, Partial<PlayerInsight>> = {}) =>
  (p: P) =>
    ({
      projected: p.media_num,
      minToValorize: null,
      ...withMatch,
      ...overrides[p.atleta_id],
    }) as PlayerInsight;

describe('suggestCaptain', () => {
  it('escolhe a maior projeção entre os prováveis com jogo', () => {
    const starters = [player(1, 5), player(2, 9, DUVIDA), player(3, 7), player(4, 8)];
    const result = suggestCaptain(starters, insightFor({ 4: { match: undefined } }));
    // 2 está em dúvida e 4 não tem jogo
    expect(result?.player.atleta_id).toBe(3);
    expect(result?.projected).toBe(7);
  });

  it('retorna undefined sem candidatos', () => {
    expect(suggestCaptain([undefined, player(1, 5, DUVIDA)], insightFor())).toBeUndefined();
  });
});

describe('buildLineupProjection', () => {
  it('aplica o multiplicador do capitão e conta quem deve valorizar', () => {
    const starters = [player(1, 6), player(2, 4), undefined];
    const result = buildLineupProjection(
      starters,
      1,
      insightFor({ 1: { minToValorize: 5 }, 2: { minToValorize: 5 } })
    );
    expect(result.projected).toBe(6 * 1.5 + 4);
    expect(result.filled).toBe(2);
    expect(result.withMinimum).toBe(2);
    expect(result.likelyToValorize).toBe(1);
  });

  it('lista os titulares que não são prováveis', () => {
    const result = buildLineupProjection([player(1, 6, DUVIDA)], 0, insightFor());
    expect(result.unlikely.map((p) => p.atleta_id)).toEqual([1]);
  });
});
