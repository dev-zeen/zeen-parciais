/**
 * Partes puras do refresh de sessão do GloboID (POST /v2/refresh-token):
 * montar o corpo, ler a resposta e extrair o globo_id dos tokens.
 */

export type TokenSet = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
};

export type RefreshResponse = {
  overall_status?: number;
  results?: {
    status: number;
    globo_id: string;
    tokens?: Partial<TokenSet>;
  }[];
};

/** Recusa definitiva do GloboID: a sessão acabou e é preciso entrar de novo. */
export const REFRESH_REJECTED = 'Refresh token rejected';

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decodifica base64url para texto UTF-8 (sem depender de atob/Buffer). */
function base64UrlDecode(input: string): string {
  const clean = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64.indexOf(char);
    if (value < 0) throw new Error('Invalid base64');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return decodeURIComponent(bytes.map((b) => `%${b.toString(16).padStart(2, '0')}`).join(''));
}

/** Claims de um JWT, sem validar a assinatura (só para ler dados do próprio usuário). */
export function decodeJwtPayload(token?: string): Record<string, unknown> | null {
  const payload = token?.split('.')[1];
  if (!payload) return null;
  try {
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

/** O globo_id vem nos claims do id_token ou do access_token (`globo_id`, ou `sub`). */
export function globoIdFromTokens(tokens: TokenSet): string | undefined {
  for (const token of [tokens.id_token, tokens.access_token]) {
    const claims = decodeJwtPayload(token);
    const id = claims?.globo_id ?? claims?.sub;
    if (typeof id === 'string' && id) return id;
  }
  return undefined;
}

export function buildRefreshBody(clientId: string, globoId: string, tokens: TokenSet) {
  return {
    client_id: clientId,
    globo_id: globoId,
    tokens: [
      {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    ],
  };
}

/**
 * Tokens novos da resposta. Mantém o refresh_token/id_token anteriores se a
 * resposta não trouxer. Lança REFRESH_REJECTED se o GloboID recusou.
 */
export function parseRefreshResponse(
  data: RefreshResponse,
  globoId: string,
  previous: TokenSet
): TokenSet {
  const result = data.results?.find((item) => item.globo_id === globoId) ?? data.results?.[0];
  if (!result || result.status !== 200 || !result.tokens?.access_token) {
    throw new Error(REFRESH_REJECTED);
  }
  return {
    access_token: result.tokens.access_token,
    refresh_token: result.tokens.refresh_token ?? previous.refresh_token,
    id_token: result.tokens.id_token ?? previous.id_token,
  };
}
