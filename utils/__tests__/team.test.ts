import { describe, expect, it } from '@jest/globals';

import { LineupPlayers } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { getLuxuryReserve, onGetPayloadSaveTeam } from '@/utils/team';

const fp = (atleta_id: number, posicao_id: number) => ({ atleta_id, posicao_id }) as FullPlayer;

// 1 goleiro titular e banco com goleiro (1) e atacante (5); a vaga de meia (4) está vazia.
const lineup: LineupPlayers = {
  starting: [{ position: 1, abbr: 'gol', player: fp(10, 1) }],
  reserves: [
    { position: 1, abbr: 'gol', player: fp(20, 1) },
    { position: 4, abbr: 'mei', player: undefined },
    { position: 5, abbr: 'ata', player: fp(50, 5) },
  ],
};

describe('getLuxuryReserve', () => {
  it('mantém o id quando o jogador está no banco', () => {
    expect(getLuxuryReserve(lineup, 50)).toBe(50);
  });

  it('é zero quando o jogador não está no banco', () => {
    expect(getLuxuryReserve(lineup, 10)).toBe(0);
    expect(getLuxuryReserve(lineup, 999)).toBe(0);
  });

  it('é zero sem luxo ou sem escalação', () => {
    expect(getLuxuryReserve(lineup, 0)).toBe(0);
    expect(getLuxuryReserve(lineup, null)).toBe(0);
    expect(getLuxuryReserve(undefined, 50)).toBe(0);
  });
});

describe('onGetPayloadSaveTeam', () => {
  it('envia o reserva de luxo quando ele está no banco', () => {
    const payload = onGetPayloadSaveTeam({
      lineup,
      captain: 10,
      formation: '4-3-3',
      luxuryReserve: 50,
    });

    expect(payload).toEqual({
      atletas: [10],
      reservas: { '1': 20, '5': 50 },
      esquema: 3,
      capitao: 10,
      reserva_luxo_id: 50,
    });
  });

  it('não envia o campo sem luxo ou com luxo fora do banco', () => {
    const semLuxo = onGetPayloadSaveTeam({ lineup, captain: 10, formation: '4-3-3' });
    const foraDoBanco = onGetPayloadSaveTeam({
      lineup,
      captain: 10,
      formation: '4-3-3',
      luxuryReserve: 999,
    });

    expect(semLuxo).not.toHaveProperty('reserva_luxo_id');
    expect(foraDoBanco).not.toHaveProperty('reserva_luxo_id');
  });
});
