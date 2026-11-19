import { describe, expect, it } from '@jest/globals';

import { buildMarketReminders, describeIssues } from '@/utils/reminders';

const HOUR = 60 * 60 * 1000;
const close = Date.UTC(2026, 10, 22, 19, 0);

describe('buildMarketReminders', () => {
  it('agenda 24h, 2h e 30min antes quando falta mais de um dia', () => {
    const reminders = buildMarketReminders(close, close - 48 * HOUR, 34);
    expect(reminders.map((r) => r.id)).toEqual([
      'market-close-34-24h',
      'market-close-34-2h',
      'market-close-34-30min',
    ]);
    expect(reminders[1].date.getTime()).toBe(close - 2 * HOUR);
  });

  it('ignora lembretes que já passaram', () => {
    const reminders = buildMarketReminders(close, close - HOUR, 34);
    expect(reminders.map((r) => r.id)).toEqual(['market-close-34-30min']);
  });

  it('não agenda nada com o mercado prestes a fechar', () => {
    expect(buildMarketReminders(close, close - 10 * 60 * 1000, 34)).toEqual([]);
  });

  it('usa os problemas do time no texto', () => {
    const [reminder] = buildMarketReminders(close, close - 48 * HOUR, 34, {
      hasCaptain: false,
      unlikely: 2,
    });
    expect(reminder.body).toBe('Seu time está sem capitão e tem 2 jogadores que podem não jogar.');
  });
});

describe('describeIssues', () => {
  it('retorna null quando o time está em ordem', () => {
    expect(describeIssues({ hasCaptain: true, unlikely: 0 })).toBeNull();
    expect(describeIssues(undefined)).toBeNull();
  });

  it('usa o singular para um jogador', () => {
    expect(describeIssues({ hasCaptain: true, unlikely: 1 })).toBe(
      'Seu time tem 1 jogador que pode não jogar.'
    );
  });
});
