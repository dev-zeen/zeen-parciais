import type {
  Confronto,
  PointsCompetitionTeam,
  PointsCompetitionTeamsMap,
} from '@/models/Competition';

export type FormResult = 'V' | 'E' | 'D';

export type NextMatch = {
  rodada: number;
  adversario: PointsCompetitionTeam;
  isMandante: boolean;
};

export type StandingEntry = PointsCompetitionTeam & {
  /** Pontos de confronto (3 vitória, 1 empate), não pontuação do Cartola */
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  /** Pontuação do Cartola feita e sofrida nos confrontos */
  gp: number;
  gc: number;
  saldo: number;
  media: number;
  /** Aproveitamento de 0 a 100 */
  aproveitamento: number;
  /** Últimos 5 resultados, do mais recente para o mais antigo */
  forma: FormResult[];
  proximoConfronto: NextMatch | null;
};

/**
 * Confronto disputado: tem vencedor, ou terminou empatado (1 ponto para cada lado).
 * Antes o empate (sem vencedor) era tratado como jogo futuro e ficava fora da tabela.
 */
export const isMatchPlayed = (match: Confronto) =>
  match.vencedor_id !== null ||
  (match.mandante.pontos_conquistados === 1 && match.visitante.pontos_conquistados === 1);

const resultOf = (points: number): FormResult => (points === 3 ? 'V' : points === 1 ? 'E' : 'D');

/**
 * Classificação de pontos corridos a partir dos confrontos. Critérios, em ordem: pontos,
 * vitórias, saldo (pontuação feita menos sofrida) e pontuação feita.
 */
export function computeStandings(
  participantes: PointsCompetitionTeamsMap,
  confrontos: Record<string, Confronto[]> | undefined
): StandingEntry[] {
  type Stats = {
    pontos: number;
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    gp: number;
    gc: number;
    resultados: { rodada: number; result: FormResult }[];
  };

  const empty = (): Stats => ({
    pontos: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    gp: 0,
    gc: 0,
    resultados: [],
  });

  const stats: Record<number, Stats> = {};
  for (const team of Object.values(participantes)) stats[team.time_id] = empty();

  // Próximo confronto de cada time: a menor rodada ainda não disputada.
  const next: Record<number, { rodada: number; adversarioId: number; isMandante: boolean }> = {};

  for (const [roundKey, matches] of Object.entries(confrontos ?? {})) {
    const rodada = parseInt(roundKey, 10);
    for (const match of matches) {
      const { mandante, visitante } = match;

      if (!isMatchPlayed(match)) {
        if (!next[mandante.id] || rodada < next[mandante.id].rodada) {
          next[mandante.id] = { rodada, adversarioId: visitante.id, isMandante: true };
        }
        if (!next[visitante.id] || rodada < next[visitante.id].rodada) {
          next[visitante.id] = { rodada, adversarioId: mandante.id, isMandante: false };
        }
        continue;
      }

      for (const [side, other] of [
        [mandante, visitante],
        [visitante, mandante],
      ] as const) {
        const s = stats[side.id];
        if (!s || side.pontos_conquistados === undefined) continue;
        s.jogos += 1;
        s.pontos += side.pontos_conquistados;
        s.gp += side.pontuacao_rodada ?? 0;
        s.gc += other.pontuacao_rodada ?? 0;
        const result = resultOf(side.pontos_conquistados);
        if (result === 'V') s.vitorias += 1;
        else if (result === 'E') s.empates += 1;
        else s.derrotas += 1;
        s.resultados.push({ rodada, result });
      }
    }
  }

  return Object.values(participantes)
    .map((team) => {
      const s = stats[team.time_id] ?? empty();
      const upcoming = next[team.time_id];
      const adversario = upcoming ? participantes[upcoming.adversarioId] : undefined;
      return {
        ...team,
        pontos: s.pontos,
        jogos: s.jogos,
        vitorias: s.vitorias,
        empates: s.empates,
        derrotas: s.derrotas,
        gp: s.gp,
        gc: s.gc,
        saldo: s.gp - s.gc,
        media: s.jogos > 0 ? s.gp / s.jogos : 0,
        aproveitamento: s.jogos > 0 ? Math.round((s.pontos / (s.jogos * 3)) * 100) : 0,
        forma: [...s.resultados]
          .sort((a, b) => b.rodada - a.rodada)
          .slice(0, 5)
          .map((r) => r.result),
        proximoConfronto:
          upcoming && adversario
            ? { rodada: upcoming.rodada, adversario, isMandante: upcoming.isMandante }
            : null,
      };
    })
    .sort(
      (a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias || b.saldo - a.saldo || b.gp - a.gp
    );
}
