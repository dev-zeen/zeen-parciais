import { LeagueUserDetails, TeamLeague } from '@/models/Leagues';

export interface LeagueRequestInvite {
  slug: string;
  imagem: string;
  tipo: string;
  criacao: string;
  nome: string;
  descricao: string;
  quantidade_times: number;
  vagas_restantes: number;
  liga_id: number;
  mata_mata: boolean;
  sem_capitao: boolean;
}

export interface Requests {
  liga: Partial<LeagueUserDetails>;
  pedidos: Invite[];
}

export interface RequestsInvites {
  solicitacoes: Requests[];
}

export interface Invite {
  data: string;
  mensagem_id: number;
  time: TeamLeague;
  liga?: Partial<LeagueUserDetails>;
  nome_cartola?: string;
}
