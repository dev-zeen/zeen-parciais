import { describe, expect, it } from '@jest/globals';

import {
  REFRESH_REJECTED,
  buildRefreshBody,
  decodeJwtPayload,
  globoIdFromTokens,
  parseRefreshResponse,
} from '@/utils/globoid';

// Os testes rodam em Node; o tsconfig do app não inclui os tipos do Node.
declare const Buffer: { from(value: string): { toString(encoding: 'base64'): string } };

// JWT fictício: só o payload importa (a assinatura não é validada).
const b64url = (value: object) =>
  Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const jwt = (claims: object) => `${b64url({ alg: 'none' })}.${b64url(claims)}.sig`;

const previous = {
  access_token: jwt({ sub: 'user-1' }),
  refresh_token: 'old-refresh',
  id_token: jwt({ globo_id: 'user-1', name: 'João Ação' }),
};

describe('decodeJwtPayload', () => {
  it('lê claims com acentos (UTF-8)', () => {
    expect(decodeJwtPayload(previous.id_token)).toEqual({ globo_id: 'user-1', name: 'João Ação' });
  });

  it('retorna null para token inválido', () => {
    expect(decodeJwtPayload('abc')).toBeNull();
    expect(decodeJwtPayload('a.%%%.c')).toBeNull();
    expect(decodeJwtPayload(undefined)).toBeNull();
  });
});

describe('globoIdFromTokens', () => {
  it('usa globo_id do id_token', () => {
    expect(globoIdFromTokens(previous)).toBe('user-1');
  });

  it('cai para o sub do access_token', () => {
    expect(globoIdFromTokens({ access_token: jwt({ sub: 'user-2' }) })).toBe('user-2');
  });

  it('undefined sem claims', () => {
    expect(globoIdFromTokens({ access_token: 'opaco' })).toBeUndefined();
  });
});

describe('buildRefreshBody', () => {
  it('segue o contrato do /v2/refresh-token', () => {
    expect(buildRefreshBody('client', 'user-1', previous)).toEqual({
      client_id: 'client',
      globo_id: 'user-1',
      tokens: [
        {
          id_token: previous.id_token,
          access_token: previous.access_token,
          refresh_token: 'old-refresh',
        },
      ],
    });
  });
});

describe('parseRefreshResponse', () => {
  it('extrai os tokens de results[].tokens', () => {
    const data = {
      overall_status: 200,
      results: [
        {
          status: 200,
          globo_id: 'user-1',
          tokens: { access_token: 'new-access', id_token: 'new-id', refresh_token: 'new-refresh' },
        },
      ],
    };
    expect(parseRefreshResponse(data, 'user-1', previous)).toEqual({
      access_token: 'new-access',
      id_token: 'new-id',
      refresh_token: 'new-refresh',
    });
  });

  it('mantém refresh/id anteriores quando a resposta não traz', () => {
    const data = { results: [{ status: 200, globo_id: 'user-1', tokens: { access_token: 'a' } }] };
    expect(parseRefreshResponse(data, 'user-1', previous)).toMatchObject({
      refresh_token: 'old-refresh',
      id_token: previous.id_token,
    });
  });

  it.each([
    [{ overall_status: 200, results: [] }],
    [{ results: [{ status: 401, globo_id: 'user-1' }] }],
    [{ results: [{ status: 200, globo_id: 'user-1', tokens: {} }] }],
    [{}],
  ])('recusa resposta sem tokens válidos', (data) => {
    expect(() => parseRefreshResponse(data, 'user-1', previous)).toThrow(REFRESH_REJECTED);
  });
});
