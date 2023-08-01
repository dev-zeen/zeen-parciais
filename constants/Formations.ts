import { TacticalFormations } from "@/models/Formations";

export const enum Positions {
  GOLEIRO = 1,
  LATERAL = 2,
  ZAGUEIRO = 3,
  MEIO_CAMPO = 4,
  ATACANTE = 5,
  TECNICO = 6,
}

export const FORMATIONS: TacticalFormations = {
  "3-4-3": {
    players: [
      {
        top: "82%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "5%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "39.5%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
        zone: 2,
      }, // Zagueiro
      {
        top: "59%",
        left: "74%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "5%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "28%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "51%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "74%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "10%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "5%",
        left: "39.5%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "5%",
        left: "69%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "3-5-2": {
    players: [
      {
        top: "80%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "10%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "39.5%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "69%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "0%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "19.75%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "39.50%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "59.25%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "79%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "28%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "5%",
        left: "51%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "4-3-3": {
    players: [
      {
        top: "71%",
        left: "41.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "48%",
        left: "5%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "48%",
        left: "74%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "48%",
        left: "28%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "48%",
        left: "51%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "24%",
        left: "15%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "24%",
        left: "39.5%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      },
      {
        top: "24%",
        left: "64%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "1%",
        left: "15%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "1%",
        left: "39.5%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "1%",
        left: "64%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "71%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: "LAT" }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "4-4-2": {
    players: [
      {
        top: "80%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "5%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "74%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "28%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "51%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "5%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "28%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "51%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "74%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "28%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "5%",
        left: "51%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: "LAT" }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "4-5-1": {
    players: [
      {
        top: "80%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "5%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "74%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "28%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "51%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "0%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "19.75%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "39.50%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "59.25%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "79%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "39.5%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: "LAT" }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "5-3-2": {
    players: [
      {
        top: "80%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "0%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "79%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "19.75%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "39.5%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "59.25%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "10%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "39.5%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      },
      {
        top: "32%",
        left: "69%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "28%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante
      {
        top: "5%",
        left: "51%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: "LAT" }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
  "5-4-1": {
    players: [
      {
        top: "80%",
        left: "39.5%",
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: "GOL",
      }, // Goleiro

      {
        top: "59%",
        left: "0%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "79%",
        position: Positions.LATERAL,
        player: undefined,
        abbr: "LAT",
      }, // Lateral
      {
        top: "59%",
        left: "19.75%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "39.5%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro
      {
        top: "59%",
        left: "59.25%",
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: "ZAG",
      }, // Zagueiro

      {
        top: "32%",
        left: "5%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "28%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "51%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo
      {
        top: "32%",
        left: "74%",
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: "MEI",
      }, // Meio-campo

      {
        top: "5%",
        left: "39.5%",
        position: Positions.ATACANTE,
        player: undefined,
        abbr: "ATA",
      }, // Atacante

      {
        top: "79%",
        left: "5%",
        position: Positions.TECNICO,
        player: undefined,
        abbr: "TEC",
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: "GOL" }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: "LAT" }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: "ZAG" }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: "MEI" }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: "ATA" }, // Atacante
    ],
  },
};

export const LINEUPS_DEFAULT_OBJECT = {
  1: "3-4-3",
  2: "3-5-2",
  3: "4-3-3",
  4: "4-4-2",
  5: "4-5-1",
  6: "5-3-2",
  7: "5-4-1",
};
