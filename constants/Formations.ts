import { TacticalFormations } from '@/models/Formations';

export const enum Positions {
  GOLEIRO = 1,
  LATERAL = 2,
  ZAGUEIRO = 3,
  MEIO_CAMPO = 4,
  ATACANTE = 5,
  TECNICO = 6,
}

const GET_ABSOLUTE_POSITION_PLAYER = {
  GOLEIRO: { TOP: 375, LEFT: 162 },
  DEFESA: { TOP: 265, LEFT: 12 },
  MEIO: { TOP: 150, LEFT: 12 },
  ATAQUE: { TOP: 35, LEFT: 12 },
  TECNICO: { TOP: 375, LEFT: 0 },
};

export const FORMATIONS: TacticalFormations = {
  '3-4-3': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 52,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 162,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 272,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 22,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 112,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 212,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 302,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 52,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 162,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 272,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '3-5-2': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 52,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 162,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 272,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 80,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 162,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 244,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 324,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 110,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 212,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-3-3': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 22,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 302,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 112,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 212,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 52,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 162,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 272,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 52,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 162,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 272,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-4-2': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 22,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 302,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 112,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 212,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 22,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 112,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 212,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 302,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 110,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 212,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-5-1': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 22,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 302,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 112,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 212,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 80,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 162,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 244,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 324,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 162,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '5-3-2': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 324,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 80,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 162,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 244,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 52,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 162,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 272,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 110,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 212,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '5-4-1': {
    starting: [
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.GOLEIRO.LEFT,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 324,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 80,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 162,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.DEFESA.TOP,
        left: 244,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 20,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 110,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 212,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: GET_ABSOLUTE_POSITION_PLAYER.MEIO.TOP,
        left: 310,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.ATAQUE.TOP,
        left: 162,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.TOP,
        left: GET_ABSOLUTE_POSITION_PLAYER.TECNICO.LEFT,
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        top: 0,
        left: 0,
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: 0,
        left: 0,
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: 0,
        left: 0,
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: 0,
        left: 0,
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: 0,
        left: 0,
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
};

export const LINEUPS_DEFAULT_OBJECT = {
  1: '3-4-3',
  2: '3-5-2',
  3: '4-3-3',
  4: '4-4-2',
  5: '4-5-1',
  6: '5-3-2',
  7: '5-4-1',
};
