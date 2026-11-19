import { useQueries } from '@tanstack/react-query';

import { GET_CLUB_BY_ID_AND_ROUND } from '@/constants/Endpoits';
import { FullClubInfo } from '@/models/Club';
import api from '@/services/api';

export type RoundScore = {
  round: number;
  /** undefined quando o time não escalou na rodada */
  points?: number;
  /** Soma das rodadas disputadas até esta (inclusive) */
  cumulative?: number;
};

export type SeasonSummary = {
  rounds: RoundScore[];
  played: Required<RoundScore>[];
  /** Soma das rodadas encerradas */
  total?: number;
  average?: number;
  best?: RoundScore;
  worst?: RoundScore;
  /** Média das últimas 5 rodadas disputadas, para comparar com a média geral */
  recentAverage?: number;
  isLoading: boolean;
};

const RECENT = 5;

/**
 * Pontuação de um time em cada rodada já encerrada. A API só entrega um time por rodada
 * (/time/id/:id/:rodada), então busca rodada a rodada com a mesma chave de cache da tela
 * de escalação: rodada já vista não é buscada de novo, e rodada encerrada não muda.
 */
export function useTeamSeason(teamId: number, lastClosedRound: number): SeasonSummary {
  const roundNumbers = Array.from({ length: Math.max(0, lastClosedRound) }, (_, i) => i + 1);

  const results = useQueries({
    queries: roundNumbers.map((round) => {
      const url = GET_CLUB_BY_ID_AND_ROUND.replace(':id', String(teamId)).replace(
        ':round',
        String(round)
      );
      return {
        queryKey: [url],
        queryFn: () => api.get<FullClubInfo>(url).then((r) => r.data),
        enabled: !!teamId,
        staleTime: Infinity,
        retry: 0,
        select: (data: FullClubInfo): RoundScore => ({
          round,
          // Sem atletas = não escalou; pontuação 0 nesse caso não é desempenho real.
          points: data?.atletas?.length ? (data.pontos ?? 0) : undefined,
        }),
      };
    }),
  });

  const base = results.map((result, i) => result.data ?? { round: roundNumbers[i] });
  // Acumulado até cada rodada (rodadas sem escalação não somam).
  const rounds: RoundScore[] = base.map((data, i) => ({
    ...data,
    cumulative: base.slice(0, i + 1).reduce((total, r) => total + (r.points ?? 0), 0),
  }));
  const played = rounds.filter((r): r is Required<RoundScore> => r.points !== undefined);
  const sum = (list: Required<RoundScore>[]) => list.reduce((total, r) => total + r.points, 0);

  const best = played.reduce<Required<RoundScore> | undefined>(
    (top, r) => (!top || r.points > top.points ? r : top),
    undefined
  );
  const worst = played.reduce<Required<RoundScore> | undefined>(
    (low, r) => (!low || r.points < low.points ? r : low),
    undefined
  );
  const recent = played.slice(-RECENT);

  return {
    rounds,
    played,
    total: played.length ? sum(played) : undefined,
    average: played.length ? sum(played) / played.length : undefined,
    best,
    worst,
    recentAverage: played.length > RECENT ? sum(recent) / recent.length : undefined,
    isLoading: results.some((result) => result.isLoading),
  };
}
