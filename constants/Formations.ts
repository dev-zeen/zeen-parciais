import { TacticalFormations } from '@/models/Formations';

export const enum Positions {
  GOLEIRO = 1,
  LATERAL = 2,
  ZAGUEIRO = 3,
  MEIO_CAMPO = 4,
  ATACANTE = 5,
  TECNICO = 6,
}

export const enum Zone {
  GOLEIRO = 1,
  DEFESA = 2,
  MEIO_CAMPO = 3,
  ATACANTE = 4,
  TECNICO = 5,
}

export const FORMATIONS: TacticalFormations = {
  '3-4-3': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '3-5-2': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-3-3': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Lateral
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 4,
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-4-2': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Lateral
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 4,
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      },

      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '4-5-1': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Lateral
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 4,
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      },
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '5-3-2': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro

      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Lateral
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 5,
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 4,
      }, // Zagueiro

      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      },
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante
    ],
  },
  '5-4-1': {
    starting: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 1,
      }, // Lateral
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
        zone: Zone.DEFESA,
        sequencePosition: 5,
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 2,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 3,
      }, // Zagueiro
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
        zone: Zone.DEFESA,
        sequencePosition: 4,
      }, // Zagueiro

      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo

      {
        position: Positions.ATACANTE,
        player: undefined,
        abbr: 'ATA',
      }, // Atacante

      {
        position: Positions.TECNICO,
        player: undefined,
        abbr: 'TEC',
      }, // Tecnico
    ],
    reserves: [
      {
        position: Positions.GOLEIRO,
        player: undefined,
        abbr: 'GOL',
      }, // Goleiro
      {
        position: Positions.LATERAL,
        player: undefined,
        abbr: 'LAT',
      }, // Lateral
      {
        position: Positions.ZAGUEIRO,
        player: undefined,
        abbr: 'ZAG',
      }, // Zagueiro
      {
        position: Positions.MEIO_CAMPO,
        player: undefined,
        abbr: 'MEI',
      }, // Meio-campo
      {
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
