import { FullPlayer, Player } from "@/models/Stats";

export interface PlayerFormation extends FullPlayer, Player {}

export type FormationPlayer = {
  top?: string;
  left?: string;
  position: number;
  player?: PlayerFormation | FullPlayer | undefined;
  abbr?: string;
  zone?: number;
};

export interface ISchema {
  players: FormationPlayer[];
  reserves: FormationPlayer[];
}

export interface FormationsDefault {
  [key: string]: ISchema;
}

export interface Schema {
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
