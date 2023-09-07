import {
  GET_CLUB_BY_ID,
  GET_CLUB_BY_ID_AND_ROUND,
  GET_CLUB_HISTORY,
  GET_MATCH_SUBSTITUTIONS,
  GET_MATCH_SUBSTITUTIONS_BY_ROUND,
  GET_MY_CLUB,
  SAVE_TEAM,
} from '@/constants/Endpoits';
import { FullClubInfo, Substitutions, TeamHistoryRound } from '@/models/Club';
import { useFetch, usePost, usePrefetch } from '@/utils/reactQuery';

interface SubstitutionsParams {
  id?: number | string;
  round?: number;
  requestWithRound?: boolean;
}

export const useGetMyClub = (allowRequest?: boolean) =>
  useFetch<FullClubInfo>(GET_MY_CLUB, undefined, {
    enabled: !!allowRequest,
  });

export const usePrefetchMyClub = (allowRequest?: boolean) =>
  usePrefetch<FullClubInfo>(GET_MY_CLUB, undefined, {
    enabled: !!allowRequest,
  });

export const useGetClub = (id?: number | string, round?: number) => {
  const url = GET_CLUB_BY_ID.replace(':id', String(id));

  const urlWithRound = GET_CLUB_BY_ID_AND_ROUND.replace(':id', String(id)).replace(
    ':round',
    String(round)
  );

  return useFetch<FullClubInfo>(round ? urlWithRound : url, undefined, {
    enabled: !!id,
    select: (data) => {
      const newData = {
        ...data,
        reservas:
          data?.reservas && data.reservas.length > 0
            ? data?.reservas.sort((a, b) => a.posicao_id - b.posicao_id)
            : [],
        atletas: data?.atletas.sort((a, b) => a.posicao_id - b.posicao_id),
      };

      return newData;
    },
  });
};

export const useGetHistoricMyClub = (allowRequest: boolean) =>
  useFetch<TeamHistoryRound[]>(GET_CLUB_HISTORY, undefined, {
    enabled: !!allowRequest,
  });

export const useGetMatchSubstitutions = ({ id, round }: SubstitutionsParams) => {
  const url = GET_MATCH_SUBSTITUTIONS.replace(':clubId', String(id));

  const urlWithRound = GET_MATCH_SUBSTITUTIONS_BY_ROUND.replace(':clubId', String(id)).replace(
    ':round',
    String(round)
  );

  return useFetch<Substitutions[]>(round ? urlWithRound : url, undefined, {
    enabled: round ? !!id && !!round : !!id,
  });
};

export const useSaveTeam = () => {
  return usePost(SAVE_TEAM);
};
