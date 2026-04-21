import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { CREATE_LEAGUE, GET_ALL_LEAGUES, GET_LEAGUE_BY_SLUG, INVITE_LEAGUE } from '@/constants/Endpoits';
import api from '@/services/api';

export type CreateLeagueResponse = {
  slug: string;
  mensagem: string;
};

export type CreateClassicLeaguePayload = {
  nome: string;
  descricao: string;
  tipo: string; // ex 'F' | 'A' | 'M'
  mata_mata: false;
  sem_capitao?: boolean;
  inicio_rodada?: number;
  fim_rodada?: number | null;

  // campos de flâmula (opcionais)
  tipo_flamula?: number;
  tipo_estampa_flamula?: number;
  tipo_adorno_flamula?: number;
  cor_primaria_estampa_flamula?: string;
  cor_secundaria_estampa_flamula?: string;
  cor_borda_flamula?: string;
  cor_fundo_flamula?: string;
};

export type CreateMataMataLeaguePayload = {
  rodadaInicio: number;
  tipo: string; // ex 'F'
  mata_mata: true;
  quantidade_times: number; // ex 32
  dataInicioRodada: string; // 'DD/MM'
  dataFimRodada: string; // 'DD/MM'
  sem_capitao: boolean;
  nome: string;
  descricao: string;
  fim_rodada: number | null;
  tipo_trofeu: number;
  cor_trofeu: number;
  inicio_rodada: number;
};

const createClassicLeagueRequest = async (
  payload: Omit<CreateClassicLeaguePayload, 'mata_mata'>
): Promise<CreateLeagueResponse> => {
  const body: CreateClassicLeaguePayload = { ...payload, mata_mata: false };
  const { data } = await api.post<CreateLeagueResponse>(CREATE_LEAGUE, body);
  return data;
};

export function useCreateClassicLeague(
  options?: UseMutationOptions<CreateLeagueResponse, AxiosError<{ mensagem?: string }>, Omit<CreateClassicLeaguePayload, 'mata_mata'>>
) {
  const queryClient = useQueryClient();
  return useMutation<CreateLeagueResponse, AxiosError<{ mensagem?: string }>, Omit<CreateClassicLeaguePayload, 'mata_mata'>>({
    mutationFn: createClassicLeagueRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}

const createMataMataLeagueRequest = async (
  payload: CreateMataMataLeaguePayload
): Promise<CreateLeagueResponse> => {
  const { data } = await api.post<CreateLeagueResponse>(CREATE_LEAGUE, payload);
  return data;
};

export function useCreateMataMataLeague(
  options?: UseMutationOptions<CreateLeagueResponse, AxiosError<{ mensagem?: string }>, CreateMataMataLeaguePayload>
) {
  const queryClient = useQueryClient();
  return useMutation<CreateLeagueResponse, AxiosError<{ mensagem?: string }>, CreateMataMataLeaguePayload>({
    mutationFn: createMataMataLeagueRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}

export type InviteLeaguePayload = {
  slug: string;
  teamSlugs: string[];
};

type InviteLeagueResponse = unknown;

const inviteLeagueRequest = async ({
  slug,
  teamSlugs,
}: InviteLeaguePayload): Promise<InviteLeagueResponse> => {
  // Para ligas clássicas/mata-mata, a API espera um array de slugs de times. Ex: ["palheco-fc"]
  const { data } = await api.post(INVITE_LEAGUE.replace(':slug', slug), teamSlugs);
  return data;
};

export function useInviteLeague(
  options?: UseMutationOptions<InviteLeagueResponse, AxiosError<{ mensagem?: string }>, InviteLeaguePayload>
) {
  const queryClient = useQueryClient();
  return useMutation<InviteLeagueResponse, AxiosError<{ mensagem?: string }>, InviteLeaguePayload>({
    mutationFn: inviteLeagueRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({
        queryKey: [GET_LEAGUE_BY_SLUG.replace(':slug', variables.slug)],
      });
      queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}
