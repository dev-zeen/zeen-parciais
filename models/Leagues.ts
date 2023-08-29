import { MyClubDetails } from '@/models/Club';

export interface LeagueUserDetails {
  liga_id: number;
  time_dono_id: number;
  clube_id?: number;
  nome: string;
  descricao: string;
  slug: string;
  tipo: 'A' | 'M' | 'F';
  mata_mata: boolean;
  editorial: boolean;
  patrocinador: boolean;
  criacao: string;
  sem_capitao: boolean;
  tipo_flamula: number;
  tipo_estampa_flamula: number;
  tipo_adorno_flamula: number;
  cor_primaria_estampa_flamula: string;
  cor_secundaria_estampa_flamula: string;
  cor_borda_flamula: string;
  cor_fundo_flamula: string;
  url_flamula_svg: string;
  url_flamula_png: string;
  tipo_trofeu?: string;
  cor_trofeu?: string;
  url_trofeu_svg?: string;
  url_trofeu_png?: string;
  inicio_rodada: number;
  fim_rodada?: number;
  quantidade_times?: number;
  sorteada: boolean;
  imagem: string;
  mes_ranking_num: number;
  mes_variacao_num: number;
  camp_ranking_num: number;
  camp_variacao_num: number;
  capitao_ranking_num?: number;
  capitao_variacao_num?: number;
  total_times_liga: number;
  vagas_restantes?: number;
  total_amigos_na_liga: number;
  data_inicio?: string;
  data_fim?: string;
}

export interface Friend {
  nome_cartola: string;
  slug: string;
  url_escudo_png: string;
  url_escudo_svg: string;
  foto_perfil: string;
  nome: string;
  facebook_id: number;
  time_id: number;
  assinante: boolean;
  lgpd_removido: boolean;
  lgpd_quarentena: boolean;
}

export interface TeamLeague {
  url_escudo_png: string;
  url_escudo_svg: string;
  nome_cartola: string;
  slug: string;
  foto_perfil: string;
  nome: string;
  facebook_id?: null;
  time_id: number;
  assinante: false;
  lgpd_removido: false;
  lgpd_quarentena: false;
  patrimonio?: number;
  ranking?: {
    rodada: number;
    mes: number;
    turno: number;
    campeonato: number;
    patrimonio: number;
    capitao?: number;
  };
  pontos?: {
    rodada: number;
    mes: number;
    turno: number;
    campeonato: number;
    capitao?: number;
  };
  variacao?: {
    mes: number;
    turno: number;
    campeonato: number;
    patrimonio: number;
    capitao?: number;
  };
}

export interface League {
  amigos: Friend[];
  destaques: {
    lanterninha: MyClubDetails;
    patrimonio: MyClubDetails;
    rodada: MyClubDetails;
  };
  liga: LeagueUserDetails;
  membro: boolean;
  pagina: number;

  time_dono: TeamLeague;
  time_usuario?: Partial<MyClubDetails>;
  time_usuario_mata_mata?: TeamLeague;

  times: TeamLeague[];
  convites_enviados?: CupInvites[];
  pedidos?: CupInvites[];
}

export interface ClubsByLeague {
  [key: number]: IClubsByLeague;
}

export interface IClubsByLeague {
  atletas: number[];
  capitao: number;
}

export interface CupInvites {
  data: string;
  mesangemId: number;
  time: TeamLeague;
}
