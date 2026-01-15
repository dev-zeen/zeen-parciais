import { GET_POINTS_COMPETITIONS, INVITE_POINTS_COMPETITION } from '@/constants/Endpoits';
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

export const createPointsCompetition = async (payload: CreatePointsCompetitionPayload) => {
  const res = await api.post<CreatePointsCompetitionResponse>(GET_POINTS_COMPETITIONS, payload);
  return res.data;
};

export type InvitePointsCompetitionPayload = {
  times_ids: number[];
};

export const invitePointsCompetition = async (slug: string, teamIds: number[]) => {
  // Para pontos corridos, a API espera um array de ids numéricos. Ex: [147322]
  const res = await api.post(INVITE_POINTS_COMPETITION.replace(':slug', slug), teamIds);
  return res.data;
};

