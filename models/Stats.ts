import { IClub } from '@/models/Club';

export interface Position {
  id: number;
  nome: string;
  abreviacao: string;
}

export interface IScout {
  [key: string]: number;
}

export interface Player {
  id: string;
  scout?: IScout;
  apelido: string;
  foto: string;
  pontuacao: number;
  posicao_id: number;
  clube_id: number;
  entrou_em_campo?: boolean;
}

export interface IPlayerStats {
  [key: string]: Player;
}

export interface IPositions {
  [key: string]: Position;
}

export interface PlayerStats {
  atletas: IPlayerStats;
  clubes: IClub;
  posicoes: IPositions;
  rodada: number;
  total_atletas: number;
}

export interface GatoMestre {
  media_minutos_jogados: number;
  media_pontos_mandante: number;
  media_pontos_visitante: number;
  minutos_jogados: number;
}

export interface FullPlayer {
  atleta_id: number;
  scout?: IScout;
  apelido: string;
  apelido_abreviado: string;
  entrou_em_campo?: boolean;
  nome: string;
  foto: string;
  posicao_id: number;
  clube_id: number;
  gato_mestre: GatoMestre;
  scouts: {
    mandante: IScout;
    media: IScout;
    visitante: IScout;
  };
  jogos_num: number;
  media_num: number;
  minimo_para_valorizar: number;
  pontos_num: number;
  preco_num: number;
  rodada_id: number;
  slug: string;
  status_id: number;
  variacao_num: number;
}
