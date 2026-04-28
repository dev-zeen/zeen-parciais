import { FullPlayer } from '@/models/Stats';

interface IEmblem {
  '60x60': string;
  '45x45': string;
  '30x30': string;
}

export interface Club {
  id: number;
  nome: string;
  abreviacao: string;
  slug: string;
  apelido: string;
  nome_fantasia: string;
  escudos: IEmblem;
  url_editoria?: string;
}

export interface IClub {
  [key: string]: Club;
}

export interface MyClubDetails {
  temporada_inicial: number;
  cor_fundo_escudo: string;
  cor_camisa: string;
  cor_borda_escudo: string;
  foto_perfil: string;
  nome_cartola: string;
  globo_id: string;
  nome: string;
  url_escudo_svg: string;
  url_escudo_png: string;
  url_camisa_svg: string;
  url_camisa_png: string;
  slug: string;
  cor_secundaria_estampa_escudo: string;
  sorteio_pro_num?: number;
  cor_primaria_estampa_camisa: string;
  cor_secundaria_estampa_camisa: string;
  cor_primaria_estampa_escudo: string;
  rodada_time_id: number;
  facebook_id: number;
  tipo_escudo: number;
  time_id: number;
  tipo_adorno: number;
  esquema_id: number;
  tipo_estampa_camisa: number;
  tipo_estampa_escudo: number;
  patrocinador1_id: number;
  clube_id: number;
  tipo_camisa: number;
  patrocinador2_id: number;
  assinante: boolean;
  simplificado: boolean;
  cadastro_completo: boolean;
  lgpd_removido: boolean;
  lgpd_quarentena: boolean;
}

export interface FullClubInfo {
  atletas?: FullPlayer[];
  capitao_id?: number;
  reserva_luxo_id?: number | null;
  extra_id?: number | null;
  esquema_id?: number;
  patrimonio?: number;
  pontos?: number;
  pontos_campeonato?: number;
  ranking: {
    anterior: {
      mes: number;
      posicao: number;
      ranking_id: number;
    };
    atual: {
      mes: number;
      posicao: number;
      ranking_id: number;
    };
    melhor_ranking_id: number;
  };
  reservas?: FullPlayer[];
  rodada_atual: number;
  servicos?: any[];
  time: MyClubDetails;
  total_ligas?: number;
  total_ligas_matamata?: number;
  valor_time?: number;
  variacao_patrimonio?: number;
  variacao_pontos?: number;
  mensagem?: string;
}

export interface TeamHistoryRound {
  patrimonio: number;
  pontos: number;
  rodada_id: number;
}

export interface Substitutions {
  entrou: FullPlayer;
  saiu: FullPlayer;
  posicao_id: number;
}
