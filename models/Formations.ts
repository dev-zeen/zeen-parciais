import { FullPlayer, IScout } from '@/models/Stats';

export interface LineupPlayer extends FullPlayer {
  id: string;
  scout?: IScout;
  apelido: string;
  foto: string;
  pontuacao: number;
  posicao_id: number;
  clube_id: number;
  entrou_em_campo: boolean;
}

export type LineupPosition = {
  position: number;
  abbr: string;
  player?: LineupPlayer | FullPlayer | undefined;
  top?: string;
  left?: string;
};

export interface LineupPlayers {
  starting: LineupPosition[];
  reserves: LineupPosition[];
}

export interface TacticalFormations {
  [key: string]: LineupPlayers;
}

export interface Lineup {
  atletas: number[];
  reservas: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  esquema: number;
  capitao: number;
}
