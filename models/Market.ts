import { IClub } from '@/models/Club';
import { PlayerStatus } from '@/models/Player';
import { FullPlayer, IPositions } from '@/models/Stats';

export interface MarketStatus {
  rodada_atual: number;
  status_mercado: 1 | 2 | 3 | 4;
  esquema_default_id: number;
  cartoleta_inicial: number;
  max_ligas_free: number;
  max_ligas_pro: number;
  max_ligas_matamata_free: number;
  max_criar_ligas_matamata_free: number;
  max_ligas_matamata_pro: number;
  max_ligas_patrocinadas_free: number;
  max_ligas_patrocinadas_pro_num: number;
  max_atletas_favoritos_free: number;
  max_atletas_favoritos_pro: number;
  game_over: boolean;
  temporada: number;
  reativar: boolean;
  exibe_sorteio_pro: boolean;
  fechamento: {
    dia: number;
    mes: number;
    ano: number;
    hora: number;
    minuto: number;
    timestamp: number;
  };
  limites_competicao: {
    total_confronto_pro?: number;
    total_confronto_free?: number;
    criacao_confronto_pro?: number;
    criacao_confronto_free?: number;
  };
  limites_competicoes: {
    pontos_corridos: {
      free: {
        criacao: number;
        participacao: number;
      };
      pro: {
        criacao: number;
        participacao: number;
      };
    };
  };
  /**
   * Alguns payloads expõem `pontos_corridos` diretamente no root do /mercado/status.
   * Mantemos opcional para compatibilidade e fazemos fallback em runtime.
   */
  pontos_corridos?: {
    free: {
      criacao: number;
      participacao: number;
    };
    pro: {
      criacao: number;
      participacao: number;
    };
  };
  times_escalados: number;
  mercado_pos_rodada: boolean;
  novo_mes_ranking: boolean;
  degustacao_gatomestre: boolean;
  bola_rolando: boolean;
  nome_rodada: string;
  rodada_final: number;
}

export interface Market {
  atletas: FullPlayer[];
  clubes: IClub;
  posicoes: IPositions;
  status: PlayerStatus;
}
