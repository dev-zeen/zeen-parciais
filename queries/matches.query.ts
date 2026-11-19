import { UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';

import { MATCHES_ACTUAL_ROUND, MATCHES_BY_ROUND } from '@/constants/Endpoits';
import { Matches } from '@/models/Matches';
import api from '@/services/api';

export const useGetMatchs = () =>
  useQuery<Matches>({
    queryKey: [MATCHES_ACTUAL_ROUND],
    queryFn: () => api.get<Matches>(MATCHES_ACTUAL_ROUND).then((r) => r.data),
  });

// Fora do hook: referência estável, então o resultado só muda quando os dados mudam.
const combineRounds = (results: UseQueryResult<Matches>[]) => ({
  data: results.map((result) => result.data).filter((data): data is Matches => !!data),
  isLoading: results.some((result) => result.isLoading),
  isError: results.some((result) => result.isError),
  refetch: () => Promise.all(results.map((result) => result.refetch())),
});

/**
 * Partidas de várias rodadas (calendário). O calendário muda pouco, então fica
 * uma hora em cache.
 */
export const useGetMatchesByRounds = (rounds: number[]) =>
  useQueries({
    queries: rounds.map((round) => {
      const url = MATCHES_BY_ROUND.replace(':round', String(round));
      return {
        queryKey: [url],
        queryFn: () => api.get<Matches>(url).then((r) => r.data),
        staleTime: 1000 * 60 * 60,
      };
    }),
    combine: combineRounds,
  });
