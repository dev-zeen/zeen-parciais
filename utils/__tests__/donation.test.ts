import { describe, expect, it } from '@jest/globals';

import { shouldOfferDonation } from '@/utils/donation';

describe('shouldOfferDonation', () => {
  it('oferece quando permitida e o patrimônio está abaixo de C$ 100', () => {
    expect(shouldOfferDonation({ allowed: true, patrimony: 99.9, round: 36 })).toBe(true);
  });

  it('não oferece quando a doação da temporada já foi usada', () => {
    expect(shouldOfferDonation({ allowed: false, patrimony: 50, round: 36 })).toBe(false);
  });

  it('não oferece com patrimônio de C$ 100 ou mais, ou sem patrimônio', () => {
    expect(shouldOfferDonation({ allowed: true, patrimony: 100, round: 36 })).toBe(false);
    expect(shouldOfferDonation({ allowed: true, patrimony: undefined, round: 36 })).toBe(false);
  });

  it('esconde na rodada adiada e volta na seguinte', () => {
    const base = { allowed: true, patrimony: 80, dismissedRound: 36 };
    expect(shouldOfferDonation({ ...base, round: 36 })).toBe(false);
    expect(shouldOfferDonation({ ...base, round: 37 })).toBe(true);
  });
});
