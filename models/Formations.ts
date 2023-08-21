import { FullPlayer, Player } from '@/models/Stats';

export interface LineupPlayer extends Player, FullPlayer {}

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
