import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  GET_POINTS_COMPETITION_BY_SLUG,
  GET_POINTS_COMPETITIONS,
  INVITE_POINTS_COMPETITION,
} from '@/constants/Endpoits';
import type { CompetitionPrivacy } from '@/models/Competition';
import api from '@/services/api';

export type CreatePointsCompetitionPayload = {
  nome: string;
  descricao: string;
  privacidade: CompetitionPrivacy; // 'A' | 'F'
  quantidade_times: number;
  tem_returno: boolean;
  tipo_taca_id: number;
  cor_taca_id: number;
  patrocinador_id: number | null;
  rodada_inicial?: number;
  rodada_final?: number;
};

export type CreatePointsCompetitionResponse = {
  slug: string;
  mensagem?: string;
};

const createPointsCompetitionRequest = async (
  payload: CreatePointsCompetitionPayload
): Promise<CreatePointsCompetitionResponse> => {
  const { data } = await api.post<CreatePointsCompetitionResponse>(GET_POINTS_COMPETITIONS, payload);
  return data;
};

export function useCreatePointsCompetition(
  options?: UseMutationOptions<CreatePointsCompetitionResponse, AxiosError<{ mensagem?: string }>, CreatePointsCompetitionPayload>
) {
  const queryClient = useQueryClient();
  return useMutation<CreatePointsCompetitionResponse, AxiosError<{ mensagem?: string }>, CreatePointsCompetitionPayload>({
    mutationFn: createPointsCompetitionRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [GET_POINTS_COMPETITIONS] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}

export type InvitePointsCompetitionPayload = {
  slug: string;
  teamIds: number[];
};

type InvitePointsCompetitionResponse = unknown;

const invitePointsCompetitionRequest = async ({
  slug,
  teamIds,
}: InvitePointsCompetitionPayload): Promise<InvitePointsCompetitionResponse> => {
  // Para pontos corridos, a API espera um array de ids numéricos. Ex: [147322]
  const { data } = await api.post(INVITE_POINTS_COMPETITION.replace(':slug', slug), teamIds);
  return data;
};

export function useInvitePointsCompetition(
  options?: UseMutationOptions<InvitePointsCompetitionResponse, AxiosError<{ mensagem?: string }>, InvitePointsCompetitionPayload>
) {
  const queryClient = useQueryClient();
  return useMutation<InvitePointsCompetitionResponse, AxiosError<{ mensagem?: string }>, InvitePointsCompetitionPayload>({
    mutationFn: invitePointsCompetitionRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [GET_POINTS_COMPETITION_BY_SLUG.replace(':slug', variables.slug)],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}

