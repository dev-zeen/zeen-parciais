import { TacticalFormations } from '@/models/Formations';

export const enum Positions {
  GOLEIRO = 1,
  LATERAL = 2,
  ZAGUEIRO = 3,
  MEIO_CAMPO = 4,
  ATACANTE = 5,
  TECNICO = 6,
}

export const FORMATIONS: TacticalFormations = {
  '3-4-3': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: '52%',
        left: '5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '39.5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '74%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '29%',
        left: '5%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '28%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '51%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '74%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '5%',
        left: '10%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '39.5%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '69%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '73%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '3-5-2': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        top: '52%',
        left: '5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '39.5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '74%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '29%',
        left: '0%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '19.75%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '39.50%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '59.25%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '79%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '28%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '51%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '73%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '4-3-3': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: '52%',
        left: '5%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '74%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '28%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '51%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: '29%',
        left: '15%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '39.5%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        top: '29%',
        left: '64%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '15%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '39.5%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '64%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '73%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: 'LAT' }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '4-4-2': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: '52%',
        left: '5%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '74%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '28%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '51%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: '29%',
        left: '5%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '28%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '51%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '74%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '28%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '51%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '79%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: 'LAT' }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '4-5-1': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: '52%',
        left: '5%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '74%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '28%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '51%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: '29%',
        left: '0%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '19.75%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '39.50%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '59.25%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '79%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '39.5%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '79%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: 'LAT' }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '5-3-2': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: '52%',
        left: '0%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '79%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '19.75%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '39.5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '59.25%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: '29%',
        left: '10%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '39.5%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        top: '29%',
        left: '69%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '28%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        top: '5%',
        left: '51%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '79%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: 'LAT' }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
    ],
  },
  '5-4-1': {
    starting: [
      {
        top: '73%',
        left: '39.5%',
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        top: '52%',
        left: '0%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '79%',
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        top: '52%',
        left: '19.75%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '39.5%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        top: '52%',
        left: '59.25%',
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro

      {
        top: '29%',
        left: '5%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '28%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '51%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        top: '29%',
        left: '74%',
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        top: '5%',
        left: '39.5%',
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        top: '79%',
        left: '5%',
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      { position: Positions.GOLEIRO, player: undefined, abbr: 'GOL' }, // Goleiro
      { position: Positions.LATERAL, player: undefined, abbr: 'LAT' }, // Lateral
      { position: Positions.ZAGUEIRO, player: undefined, abbr: 'ZAG' }, // Zagueiro
      { position: Positions.MEIO_CAMPO, player: undefined, abbr: 'MEI' }, // Meio-campo
      { position: Positions.ATACANTE, player: undefined, abbr: 'ATA' }, // Atacante
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
