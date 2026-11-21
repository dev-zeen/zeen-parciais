import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  CARTOLETAS_DONATION,
  GET_CLUB_BY_ID,
  GET_CLUB_BY_ID_AND_ROUND,
  GET_CLUB_HISTORY,
  GET_LINEUP_HISTORY,
  GET_RANKING_LEVELS,
  GET_MATCH_SUBSTITUTIONS,
  GET_MATCH_SUBSTITUTIONS_BY_ROUND,
  GET_MY_CLUB,
  SAVE_TEAM,
} from '@/constants/Endpoits';
import {
  CartoletasDonationStatus,
  FullClubInfo,
  LineupHistoryEntry,
  RankingLevel,
  Substitutions,
  TeamHistoryRound,
} from '@/models/Club';
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

/** Status da doação de cartoletas (uma por temporada). */
export const useGetCartoletasDonation = (enabled: boolean) =>
  useQuery<CartoletasDonationStatus>({
    queryKey: [CARTOLETAS_DONATION],
    queryFn: () => api.get<CartoletasDonationStatus>(CARTOLETAS_DONATION).then((r) => r.data),
    enabled,
  });

/** Recebe a doação: o patrimônio volta a C$ 100. */
export const useReceiveCartoletasDonation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<{ mensagem?: string }>>({
    mutationFn: () => api.post(CARTOLETAS_DONATION),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_MY_CLUB] });
      queryClient.invalidateQueries({ queryKey: [CARTOLETAS_DONATION] });
    },
  });
};

/** Cada salvamento do time na rodada, do mais recente ao mais antigo. */
export const useGetLineupHistory = (round: number | undefined, enabled: boolean) => {
  const url = GET_LINEUP_HISTORY.replace(':round', String(round));
  return useQuery<LineupHistoryEntry[]>({
    queryKey: [url],
    queryFn: () =>
      api
        .get<LineupHistoryEntry[] | null>(url)
        .then((r) => (Array.isArray(r.data) ? r.data : [])),
    enabled: enabled && !!round,
  });
};

/** Níveis do cartoleiro; tabela fixa da temporada. */
export const useGetRankingLevels = () =>
  useQuery<RankingLevel[]>({
    queryKey: [GET_RANKING_LEVELS],
    queryFn: () =>
      api
        .get<RankingLevel[] | null>(GET_RANKING_LEVELS)
        .then((r) => (Array.isArray(r.data) ? r.data : [])),
    staleTime: Infinity,
  });
