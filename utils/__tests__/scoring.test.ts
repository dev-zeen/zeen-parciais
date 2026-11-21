import { describe, expect, it } from '@jest/globals';

import { SCOUTS } from '@/constants/Scouts';
import {
  SCORING_EXAMPLE,
  SCOUT_GROUPS,
  captainPoints,
  sumScoutPoints,
} from '@/utils/scoring';

describe('sumScoutPoints', () => {
  it('soma os lances com os valores da tabela', () => {
    // 8 (G) + 5 (A) - 1 (CA)
    expect(sumScoutPoints(['G', 'A', 'CA'])).toBe(12);
  });

  it('arredonda as casas decimais', () => {
    // 1,2 (FD) + 0,8 (FF) + 0,5 (FS)
    expect(sumScoutPoints(['FD', 'FF', 'FS'])).toBe(2.5);
  });

  it('o exemplo da tela fecha em 14,5', () => {
    expect(sumScoutPoints(SCORING_EXAMPLE.map((event) => event.code))).toBe(14.5);
  });
});

describe('captainPoints', () => {
  it('multiplica por 1,5, inclusive pontos negativos', () => {
    expect(captainPoints(10)).toBe(15);
    expect(captainPoints(-3)).toBe(-4.5);
  });
});

describe('SCOUT_GROUPS', () => {
  it('todo código dos grupos existe na tabela de scouts', () => {
    const codes = SCOUT_GROUPS.flatMap((group) => group.codes);
    codes.forEach((code) => expect(SCOUTS[code]).toBeDefined());
  });
});
