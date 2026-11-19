/**
 * Calendário de confrontos das próximas rodadas, com a dificuldade de cada jogo
 * pela posição atual do adversário na tabela. Funções puras.
 */
import type { Matches } from '@/models/Matches';

/** 1 = fácil (adversário da parte de baixo) … 4 = difícil (G5). */
export type Difficulty = 1 | 2 | 3 | 4;

export type Fixture = {
  round: number;
  opponentId: number;
  isHome: boolean;
  difficulty?: Difficulty;
};

export type ClubFixtures = {
  clubId: number;
  /** Uma posição por rodada; null quando o clube não joga nela */
  fixtures: (Fixture | null)[];
  /** Média de dificuldade dos jogos (menor = calendário mais fácil) */
  average: number | null;
};

export function difficultyOf(rank?: number): Difficulty | undefined {
  if (!rank || rank <= 0) return undefined;
  if (rank <= 5) return 4;
  if (rank <= 10) return 3;
  if (rank <= 15) return 2;
  return 1;
}

/** Posição atual de cada clube, a partir das partidas da rodada mais recente. */
export function ranksFromMatches(matches?: Matches): Map<number, number> {
  const ranks = new Map<number, number>();
  for (const match of matches?.partidas ?? []) {
    if (match.clube_casa_posicao) ranks.set(match.clube_casa_id, match.clube_casa_posicao);
    if (match.clube_visitante_posicao) {
      ranks.set(match.clube_visitante_id, match.clube_visitante_posicao);
    }
  }
  return ranks;
}

/**
 * Uma linha por clube com os confrontos de cada rodada, do calendário mais fácil
 * para o mais difícil. `rounds` deve vir na ordem das rodadas.
 */
export function buildFixtureTicker(rounds: Matches[], ranks: Map<number, number>): ClubFixtures[] {
  const clubIds = new Set<number>();
  rounds.forEach((round) =>
    round.partidas?.forEach((match) => {
      clubIds.add(match.clube_casa_id);
      clubIds.add(match.clube_visitante_id);
    })
  );

  const rows = [...clubIds].map((clubId): ClubFixtures => {
    const fixtures = rounds.map((round): Fixture | null => {
      const match = round.partidas?.find(
        (item) => item.clube_casa_id === clubId || item.clube_visitante_id === clubId
      );
      if (!match) return null;
      const isHome = match.clube_casa_id === clubId;
      const opponentId = isHome ? match.clube_visitante_id : match.clube_casa_id;
      return {
        round: round.rodada,
        opponentId,
        isHome,
        difficulty: difficultyOf(ranks.get(opponentId)),
      };
    });

    const rated = fixtures.filter((item) => item?.difficulty) as Required<Fixture>[];
    const average = rated.length
      ? rated.reduce((sum, item) => sum + item.difficulty, 0) / rated.length
      : null;

    return { clubId, fixtures, average };
  });

  return rows.sort((a, b) => (a.average ?? 5) - (b.average ?? 5));
}
