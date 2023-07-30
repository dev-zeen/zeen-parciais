import { QueryObserverOptions } from "@tanstack/react-query";

import {
  GET_CLUB_BY_ID,
  GET_CLUB_BY_ID_AND_ROUND,
  GET_CLUB_HISTORY,
  GET_MATCH_SUBSTITUTIONS,
  GET_MATCH_SUBSTITUTIONS_BY_ROUND,
  GET_MY_CLUB,
} from "@/constants/Endpoits";
import { FullClubInfo, Substitutions, TeamHistoryRound } from "@/models/Club";
import { useFetch } from "@/utils/reactQuery";

export const useGetMyClub = (isAutheticated: boolean) =>
  useFetch<FullClubInfo>(GET_MY_CLUB, undefined, {
    enabled: isAutheticated,
  });

export const useGetClub = (
  id?: number | string,
  round?: number,
  config?: QueryObserverOptions
) => {
  const url = GET_CLUB_BY_ID.replace(":id", String(id));

  const urlWithRound = GET_CLUB_BY_ID_AND_ROUND.replace(
    ":id",
    String(id)
  ).replace(":round", String(round));

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

export const useGetHistoricMyClub = () =>
  useFetch<TeamHistoryRound[]>(GET_CLUB_HISTORY);

interface SubstitutionsParams {
  id?: number | string;
  round?: number;
  requestWithRound?: boolean;
}
export const useGetMatchSubstitutions = ({
  id,
  round,
  requestWithRound,
}: SubstitutionsParams) => {
  const url = GET_MATCH_SUBSTITUTIONS.replace(":clubId", String(id));

  const urlWithRound = GET_MATCH_SUBSTITUTIONS_BY_ROUND.replace(
    ":clubId",
    String(id)
  ).replace(":round", String(round));

  return useFetch<Substitutions[]>(round ? urlWithRound : url, undefined, {
    enabled: requestWithRound ? !!id && !!round : !!id,
  });
};
