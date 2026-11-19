import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';

import { ACCESS_TOKEN_KEY_STORAGE, GLOBOID_CLIENT_SETTINGS_KEY } from '@/constants/Keys';
import { env } from '@/lib/env';
import {
  REFRESH_REJECTED,
  RefreshResponse,
  TokenSet,
  buildRefreshBody,
  globoIdFromTokens,
  parseRefreshResponse,
} from '@/utils/globoid';

type TokenData = TokenSet;

type GloboidClientSettings = {
  clientId: string;
  enableRefreshTokenMode: boolean;
};

const DEFAULT_CLIENT_ID = env.EXPO_PUBLIC_GLOBOID_CLIENT_ID;
const GLOBOID_BASE_URL = env.EXPO_PUBLIC_GLOBOID_BASE_URL;
const GLOBOID_REFRESH_URL = `${GLOBOID_BASE_URL}/v2/refresh-token`;
// O GloboID valida a origem: o refresh é feito como o site do Cartola faz.
const CARTOLA_ORIGIN = new URL(env.EXPO_PUBLIC_AUTH_URL).origin;
const GLOBOID_CLIENT_SETTINGS_URL = `${GLOBOID_BASE_URL}/v1/clients/${DEFAULT_CLIENT_ID}/settings`;

// ============================================
// GLOBOID CLIENT SETTINGS
// ============================================

export async function fetchGloboidClientSettings(): Promise<GloboidClientSettings> {
  try {
    console.log('🔍 Fetching Globoid client settings...');
    
    const response = await axios.get<GloboidClientSettings>(GLOBOID_CLIENT_SETTINGS_URL);
    
    console.log('✅ Client settings fetched:', response.data);
    
    // Salva as configurações no storage
    await AsyncStorage.setItem(GLOBOID_CLIENT_SETTINGS_KEY, JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching client settings:', error);
    
    // Retorna configurações padrão em caso de erro
    return {
      clientId: DEFAULT_CLIENT_ID,
      enableRefreshTokenMode: true,
    };
  }
}

export async function getGloboidClientSettings(): Promise<GloboidClientSettings> {
  try {
    const settingsString = await AsyncStorage.getItem(GLOBOID_CLIENT_SETTINGS_KEY);
    
    if (settingsString) {
      return JSON.parse(settingsString);
    }
    
    // Se não tem no storage, busca da API
    return await fetchGloboidClientSettings();
  } catch (error) {
    console.error('Error getting client settings:', error);
    
    // Retorna configurações padrão em caso de erro
    return {
      clientId: DEFAULT_CLIENT_ID,
      enableRefreshTokenMode: true,
    };
  }
}

export async function clearGloboidClientSettings(): Promise<void> {
  await AsyncStorage.removeItem(GLOBOID_CLIENT_SETTINGS_KEY);
}

// ============================================
// TOKEN STORAGE
// ============================================

export async function getTokensFromStorage(): Promise<TokenData | null> {
  try {
    const tokenString = await AsyncStorage.getItem(ACCESS_TOKEN_KEY_STORAGE);
    if (!tokenString) return null;

    // Tenta fazer parse como JSON (novo formato)
    try {
      const tokens = JSON.parse(tokenString);
      
      // Se não tem refresh_token, é formato antigo - limpa e retorna null
      if (!tokens.refresh_token) {
        console.log('⚠️ Old token format detected (no refresh_token) - clearing storage');
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY_STORAGE);
        return null;
      }
      
      return tokens;
    } catch {
      // Se não consegue fazer parse, é string pura (formato muito antigo) - limpa
      console.log('⚠️ Legacy token format detected (plain string) - clearing storage');
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY_STORAGE);
      return null;
    }
  } catch (error) {
    console.error('Error getting tokens from storage:', error);
    return null;
  }
}

export async function getTokenFromStorage(): Promise<string | null> {
  const tokens = await getTokensFromStorage();
  return tokens?.access_token || null;
}

export async function setAuthTokens(tokens: TokenData) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY_STORAGE, JSON.stringify(tokens));
}

export async function setAuthToken(token: string) {
  // Mantém compatibilidade com código antigo
  const existingTokens = await getTokensFromStorage();
  
  if (existingTokens && existingTokens.refresh_token) {
    // Se já temos refresh_token, atualiza só o access_token
    await setAuthTokens({
      ...existingTokens,
      access_token: token,
    });
  } else {
    // Salva como string simples (fallback)
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY_STORAGE, token);
  }
}

export async function refreshToken(): Promise<TokenData> {
  const tokens = await getTokensFromStorage();

  if (!tokens?.refresh_token) {
    throw new Error('No refresh token available');
  }

  const globoId = globoIdFromTokens(tokens);
  if (!globoId) {
    // Sem globo_id não há como pedir o refresh: trata como sessão encerrada.
    throw new Error('No refresh token available');
  }

  const clientSettings = await getGloboidClientSettings();
  if (!clientSettings.enableRefreshTokenMode) {
    throw new Error('Refresh token mode disabled');
  }

  try {
    const response = await axios.post<RefreshResponse>(
      GLOBOID_REFRESH_URL,
      buildRefreshBody(clientSettings.clientId, globoId, tokens),
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          Origin: CARTOLA_ORIGIN,
          Referer: `${CARTOLA_ORIGIN}/`,
          'x-globoid-js-client-id': clientSettings.clientId,
        },
      }
    );
    return parseRefreshResponse(response.data, globoId, tokens);
  } catch (error) {
    // 4xx do GloboID = refresh token inválido/expirado: a sessão acabou.
    // Erros de rede ou 5xx seguem como estão, para não deslogar por instabilidade.
    if (isAxiosError(error) && error.response && error.response.status < 500) {
      throw new Error(REFRESH_REJECTED);
    }
    throw error;
  }
}

export async function updateTokenInStorage(): Promise<TokenData> {
  const data = await refreshToken();
  await setAuthTokens(data);
  return data;
}
