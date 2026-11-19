/**
 * Lembretes de fechamento do mercado. Funções puras (sem expo-notifications)
 * para poderem ser testadas; o agendamento fica em lib/marketReminders.ts.
 */

const MINUTE = 60 * 1000;

/** Antecedências dos lembretes, da mais distante para a mais próxima. */
export const REMINDER_OFFSETS = [
  { id: '24h', ms: 24 * 60 * MINUTE, label: '24 horas' },
  { id: '2h', ms: 2 * 60 * MINUTE, label: '2 horas' },
  { id: '30min', ms: 30 * MINUTE, label: '30 minutos' },
] as const;

export type LineupIssues = {
  hasCaptain: boolean;
  /** Titulares com status diferente de Provável */
  unlikely: number;
};

export type Reminder = {
  id: string;
  date: Date;
  title: string;
  body: string;
};

export function describeIssues(issues?: LineupIssues): string | null {
  if (!issues) return null;
  const parts: string[] = [];
  if (!issues.hasCaptain) parts.push('está sem capitão');
  if (issues.unlikely > 0) {
    parts.push(
      issues.unlikely === 1
        ? 'tem 1 jogador que pode não jogar'
        : `tem ${issues.unlikely} jogadores que podem não jogar`
    );
  }
  return parts.length ? `Seu time ${parts.join(' e ')}.` : null;
}

/**
 * Lembretes que ainda fazem sentido agendar: só os que caem no futuro.
 * `roundId` entra no identificador para trocar os lembretes a cada rodada.
 */
export function buildMarketReminders(
  closeAtMs: number,
  nowMs: number,
  roundId: number,
  issues?: LineupIssues
): Reminder[] {
  const warning = describeIssues(issues);

  return REMINDER_OFFSETS.filter(({ ms }) => closeAtMs - ms > nowMs).map(({ id, ms, label }) => ({
    id: `market-close-${roundId}-${id}`,
    date: new Date(closeAtMs - ms),
    title: `Mercado fecha em ${label}`,
    body: warning ?? 'Confira sua escalação antes do fechamento.',
  }));
}
