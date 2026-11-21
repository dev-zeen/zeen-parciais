import { RankingLevel } from '@/models/Club';

/** Nível pelo id; undefined enquanto a tabela não carregou ou com id desconhecido. */
export function findRankingLevel(levels: RankingLevel[] | undefined, id: number | undefined) {
  if (!levels?.length || !id) return undefined;
  return levels.find((level) => level.ranking_id === id);
}

/** Progresso até o nível máximo, de 0 a 1 (Inicial = 1 de 11). */
export function rankingProgress(levels: RankingLevel[] | undefined, id: number | undefined) {
  if (!levels?.length || !id) return 0;
  const max = Math.max(...levels.map((level) => level.ranking_id));
  return Math.min(1, Math.max(0, id / max));
}
