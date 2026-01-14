import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { ACCESS_TOKEN_KEY_STORAGE, GLOBOID_CLIENT_SETTINGS_KEY } from '@/constants/Keys';

type TokenData = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
};

type RefreshTokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};

type GloboidClientSettings = {
  clientId: string;
  enableRefreshTokenMode: boolean;
};

const DEFAULT_CLIENT_ID = 'cartola-web@apps.globoid';
const GLOBOID_REFRESH_URL = 'https://web-api.globoid.globo.com/v1/refresh-token';
const GLOBOID_CLIENT_SETTINGS_URL = `https://web-api.globoid.globo.com/v1/clients/${DEFAULT_CLIENT_ID}/settings`;

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

export async function refreshToken() {
  const tokens = await getTokensFromStorage();

  if (!tokens?.refresh_token) {
    throw new Error('No refresh token available');
  }

  // Busca as configurações do cliente
  const clientSettings = await getGloboidClientSettings();
  
  // Verifica se o refresh token está habilitado
  if (!clientSettings.enableRefreshTokenMode) {
    console.log('⚠️ Refresh token mode is disabled');
    throw new Error('Refresh token mode disabled');
  }

  console.log('🔄 Refreshing tokens with Globoid API...');
  console.log('🔑 Using clientId:', clientSettings.clientId);

  const response = await axios.post<RefreshTokenResponse>(
    GLOBOID_REFRESH_URL,
    {
      client_id: clientSettings.clientId,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      id_token: tokens.id_token,
    }
  );

  console.log('✅ Tokens refreshed successfully');
  return response.data;
}

export async function updateTokenInStorage(): Promise<RefreshTokenResponse> {
  try {
    const data = await refreshToken();
    
    // Atualiza todos os tokens (access, id e refresh)
    await setAuthTokens({
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
    });

    console.log('✅ Tokens updated in storage');
    return data;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    throw error;
  }
}
