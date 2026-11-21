import { describe, expect, it } from '@jest/globals';

import { LineupHistoryEntry } from '@/models/Club';
import { diffLineups, formatTransactionDate, isEmptyDiff } from '@/utils/lineupHistory';

const p = (id: number, apelido = `J${id}`) => ({ id, apelido, posicao: 'ata' });
const entry = (
  ids: number[],
  reserves: number[],
  captain?: number,
  luxury?: number
): LineupHistoryEntry => ({
  historico_transacao_id: 1,
  data_transacao: '2026-11-20 23:50:00',
  tipo: 'U',
  rodada_id: 36,
  time_id: 1,
  escalacao: ids.map((id) => p(id)),
  reservas: reserves.map((id) => p(id)),
  capitao: captain ? p(captain) : null,
  reserva_luxo: luxury ? p(luxury) : null,
});

describe('diffLineups', () => {
  it('não tem diff no primeiro salvamento da rodada', () => {
    expect(diffLineups(entry([1, 2], [9]))).toBeUndefined();
  });

  it('lista quem entrou e quem saiu, titulares e reservas', () => {
    const diff = diffLineups(entry([1, 3], [8], 1), entry([1, 2], [9], 1));
    expect(diff?.in.map((x) => x.id)).toEqual([3, 8]);
    expect(diff?.out.map((x) => x.id)).toEqual([2, 9]);
    expect(diff?.captain).toBeUndefined();
  });

  it('marca troca de capitão e de reserva de luxo', () => {
    const diff = diffLineups(entry([1, 2], [9], 2, 9), entry([1, 2], [9], 1));
    expect(diff?.captain).toEqual({ from: 'J1', to: 'J2' });
    expect(diff?.luxury).toEqual({ from: undefined, to: 'J9' });
  });

  it('reconhece salvamento sem mudanças', () => {
    const diff = diffLineups(entry([1, 2], [9], 1), entry([2, 1], [9], 1));
    expect(diff && isEmptyDiff(diff)).toBe(true);
  });
});

describe('formatTransactionDate', () => {
  it('formata dia, mês e hora', () => {
    expect(formatTransactionDate('2026-11-21 00:18:05')).toBe('21/11 às 00:18');
  });

  it('devolve o texto original se o formato for outro', () => {
    expect(formatTransactionDate('ontem')).toBe('ontem');
  });
});
