import { FullPlayer } from '@/models/Stats';

interface IEmblem {
  [key: string]: string;
}

export interface Club {
  id: string;
  nome: string;
  abreviacao: string;
  escudos: IEmblem;
  nome_fantasia: string;
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
  atletas?: FullPlayer[]; // Opcional quando time não escalado
  capitao_id?: number; // Opcional quando time não escalado
  esquema_id?: number; // Opcional quando time não escalado
  patrimonio?: number; // Opcional quando time não escalado
  pontos?: number; // Opcional quando time não escalado
  pontos_campeonato?: number; // Opcional quando time não escalado
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
  reservas?: FullPlayer[]; // Opcional quando time não escalado
  rodada_atual: number;
  servicos?: any[];
  time: MyClubDetails;
  total_ligas?: number; // Opcional quando time não escalado
  total_ligas_matamata?: number; // Opcional quando time não escalado
  valor_time?: number; // Opcional quando time não escalado
  variacao_patrimonio?: number; // Opcional quando time não escalado
  variacao_pontos?: number; // Opcional quando time não escalado
  mensagem?: string; // Mensagem quando time não foi escalado
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
