import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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
import api from '@/services/api';
import { SaveTeamPayload } from '@/utils/team';

interface SubstitutionsParams {
  id?: number | string;
  round?: number;
  requestWithRound?: boolean;
}

export const useGetMyClub = (allowRequest?: boolean) =>
  useQuery<FullClubInfo>({
    queryKey: [GET_MY_CLUB],
    queryFn: () => api.get<FullClubInfo>(GET_MY_CLUB).then((r) => r.data),
    enabled: !!allowRequest,
    select: (data) => {
      // Se não tem atletas (time não escalado), retorna dados com arrays vazios
      if (!data?.atletas) {
        return {
          ...data,
          atletas: [],
          reservas: [],
          capitao_id: data?.capitao_id ?? 0,
          esquema_id: data?.esquema_id ?? 4, // esquema default
        };
      }

      return {
        ...data,
        reservas:
          data?.reservas && data.reservas.length > 0
            ? data.reservas.sort((a, b) => a.posicao_id - b.posicao_id)
            : [],
        atletas: data.atletas.sort((a, b) => a.posicao_id - b.posicao_id),
      };
    },
  });

export const useGetClub = (id?: number | string, round?: number) => {
  const url = GET_CLUB_BY_ID.replace(':id', String(id));
  const urlWithRound = GET_CLUB_BY_ID_AND_ROUND.replace(':id', String(id)).replace(
    ':round',
    String(round)
  );
  const resolvedUrl = round ? urlWithRound : url;

  return useQuery<FullClubInfo>({
    queryKey: [resolvedUrl],
    queryFn: () => api.get<FullClubInfo>(resolvedUrl).then((r) => r.data),
    enabled: !!id,
    select: (data) => {
      // Se não tem atletas (time não escalado), retorna dados como vieram
      if (!data?.atletas) {
        return {
          ...data,
          atletas: [],
          reservas: [],
        };
      }

      return {
        ...data,
        reservas:
          data?.reservas && data.reservas.length > 0
            ? data.reservas.sort((a, b) => a.posicao_id - b.posicao_id)
            : [],
        atletas: data.atletas.sort((a, b) => a.posicao_id - b.posicao_id),
      };
    },
  });
};

export const useGetHistoricMyClub = (allowRequest: boolean) =>
  useQuery<TeamHistoryRound[]>({
    queryKey: [GET_CLUB_HISTORY],
    queryFn: () => api.get<TeamHistoryRound[]>(GET_CLUB_HISTORY).then((r) => r.data),
    enabled: !!allowRequest,
  });

export const useGetMatchSubstitutions = ({ id, round }: SubstitutionsParams) => {
  const url = GET_MATCH_SUBSTITUTIONS.replace(':clubId', String(id));
  const urlWithRound = GET_MATCH_SUBSTITUTIONS_BY_ROUND.replace(':clubId', String(id)).replace(
    ':round',
    String(round)
  );
  const resolvedUrl = round ? urlWithRound : url;

  return useQuery<Substitutions[]>({
    queryKey: [resolvedUrl],
    queryFn: () => api.get<Substitutions[]>(resolvedUrl).then((r) => r.data),
    enabled: round ? !!id && !!round : !!id,
  });
};

interface SaveTeamCallbacks {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useSaveTeam = (callbacks?: SaveTeamCallbacks) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveTeamPayload) => api.post(SAVE_TEAM, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MY_CLUB],
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      callbacks?.onError?.(error);
    },
  });
};
