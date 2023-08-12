import { FullPlayer, Player } from "@/models/Stats";

export interface LineupPlayer extends Player, FullPlayer {}

export type LineupPosition = {
  top?: string;
  left?: string;
  position: number;
  player?: LineupPlayer | FullPlayer | undefined;
  abbr?: string;
  zone?: number;
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
