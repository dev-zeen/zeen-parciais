import { CREATE_LEAGUE, INVITE_LEAGUE } from '@/constants/Endpoits';
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

export const createClassicLeague = async (payload: Omit<CreateClassicLeaguePayload, 'mata_mata'>) => {
  const body: CreateClassicLeaguePayload = { ...payload, mata_mata: false };
  const res = await api.post<CreateLeagueResponse>(CREATE_LEAGUE, body);
  return res.data;
};

export const createMataMataLeague = async (payload: CreateMataMataLeaguePayload) => {
  const res = await api.post<CreateLeagueResponse>(CREATE_LEAGUE, payload);
  return res.data;
};

export type InviteLeaguePayload = {
  times_ids: number[];
};

export const inviteLeague = async (slug: string, teamSlugs: string[]) => {
  // Para ligas clássicas/mata-mata, a API espera um array de slugs de times. Ex: ["palheco-fc"]
  const res = await api.post(INVITE_LEAGUE.replace(':slug', slug), teamSlugs);
  return res.data;
};

