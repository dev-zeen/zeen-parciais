import { LineupHistoryEntry, LineupHistoryPlayer } from '@/models/Club';

export type LineupDiff = {
  in: LineupHistoryPlayer[];
  out: LineupHistoryPlayer[];
  /** Capitão anterior e novo, quando mudou */
  captain?: { from?: string; to?: string };
  /** Reserva de luxo anterior e novo, quando mudou */
  luxury?: { from?: string; to?: string };
};

const allPlayers = (entry: LineupHistoryEntry) => [...entry.escalacao, ...entry.reservas];

/**
 * Mudanças de um salvamento em relação ao anterior (titulares e reservas juntos).
 * Sem salvamento anterior (o primeiro da rodada), devolve undefined.
 */
export function diffLineups(
  current: LineupHistoryEntry,
  previous?: LineupHistoryEntry
): LineupDiff | undefined {
  if (!previous) return undefined;

  const before = new Set(allPlayers(previous).map((player) => player.id));
  const after = new Set(allPlayers(current).map((player) => player.id));

  const diff: LineupDiff = {
    in: allPlayers(current).filter((player) => !before.has(player.id)),
    out: allPlayers(previous).filter((player) => !after.has(player.id)),
  };

  if ((current.capitao?.id ?? 0) !== (previous.capitao?.id ?? 0)) {
    diff.captain = { from: previous.capitao?.apelido, to: current.capitao?.apelido };
  }
  if ((current.reserva_luxo?.id ?? 0) !== (previous.reserva_luxo?.id ?? 0)) {
    diff.luxury = { from: previous.reserva_luxo?.apelido, to: current.reserva_luxo?.apelido };
  }

  return diff;
}

/** true quando o salvamento não mudou nada em relação ao anterior. */
export const isEmptyDiff = (diff: LineupDiff) =>
  diff.in.length === 0 && diff.out.length === 0 && !diff.captain && !diff.luxury;

/** "2026-11-21 00:18:05" → "21/11 às 00:18" (horário de Brasília, como vem da API). */
export function formatTransactionDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [, , month, day, hour, minute] = match;
  return `${day}/${month} às ${hour}:${minute}`;
}
