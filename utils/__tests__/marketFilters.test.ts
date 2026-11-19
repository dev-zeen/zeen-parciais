import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_MARKET_FILTERS,
  getActiveFilterChips,
} from '@/components/contexts/market/MarketFilters/filters.helper';

const abbr = (id: number) => (id === 262 ? 'FLA' : undefined);

describe('getActiveFilterChips', () => {
  it('sem chips no padrão', () => {
    expect(getActiveFilterChips(DEFAULT_MARKET_FILTERS, abbr)).toEqual([]);
  });

  it('um chip por filtro alterado, na ordem da tela', () => {
    const chips = getActiveFilterChips(
      {
        ...DEFAULT_MARKET_FILTERS,
        statuses: [],
        maxPrice: 10,
        fitsBalance: true,
        minAverage: 4,
        clubs: [262],
      },
      abbr
    );
    expect(chips.map((chip) => chip.label)).toEqual([
      'Todos os status',
      'Até C$ 10',
      'Cabe no saldo',
      'Média 4+',
      'FLA',
    ]);
    expect(chips[0].remove).toEqual({ statuses: DEFAULT_MARKET_FILTERS.statuses });
  });

  it('vários clubes viram contagem', () => {
    const [chip] = getActiveFilterChips({ ...DEFAULT_MARKET_FILTERS, clubs: [1, 2] }, abbr);
    expect(chip.label).toBe('2 clubes');
  });
});
