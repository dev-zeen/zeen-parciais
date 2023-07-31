import { IClub } from "@/models/Club";
import { PlayerStatus } from "@/models/Player";
import { FullPlayer, IPositions } from "@/models/Stats";

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
    total_confronto_pro: number;
    total_confronto_free: number;
    criacao_confronto_pro: number;
    criacao_confronto_free: number;
  };
  times_escalados: number;
  mercado_pos_rodada: boolean;
  novo_mes_ranking: boolean;
  degustacao_gatomestre: boolean;
  nome_rodada: string;
}

export interface Market {
  atletas: FullPlayer[];
  clubes: IClub;
  posicoes: IPositions;
  status: PlayerStatus;
}
