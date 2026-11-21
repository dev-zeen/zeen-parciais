import { describe, expect, it } from '@jest/globals';

import { RankingLevel } from '@/models/Club';
import { findRankingLevel, rankingProgress } from '@/utils/rankingLevel';

const levels: RankingLevel[] = ['Inicial', 'Bronze I', 'Bronze II', 'Bronze III'].map(
  (nome, index) => ({
    ranking_id: index + 1,
    nome,
    descricao: '',
    cor_base: '000000',
    cor_adorno: '000000',
  })
);

describe('findRankingLevel', () => {
  it('acha o nível pelo id', () => {
    expect(findRankingLevel(levels, 4)?.nome).toBe('Bronze III');
  });

  it('é undefined sem tabela ou com id desconhecido', () => {
    expect(findRankingLevel(undefined, 4)).toBeUndefined();
    expect(findRankingLevel(levels, 99)).toBeUndefined();
  });
});

describe('rankingProgress', () => {
  it('é a fração até o nível máximo', () => {
    expect(rankingProgress(levels, 2)).toBe(0.5);
    expect(rankingProgress(levels, 4)).toBe(1);
  });

  it('é zero sem dados', () => {
    expect(rankingProgress(undefined, 2)).toBe(0);
  });
});
