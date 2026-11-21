import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { getTokenFromStorage, updateTokenInStorage } from '@/lib/core/auth';
import { debugLog } from '@/utils/debugLog';
import { REFRESH_REJECTED } from '@/utils/globoid';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Rota cujo 401 não significa sessão expirada (ex.: recurso PRO).
     * O erro volta para quem chamou, sem tentar refresh nem deslogar.
     */
    optionalAuth?: boolean;
    /** Marca a repetição após o refresh, para não entrar em loop se o 401 persistir. */
    _retried?: boolean;
  }
}

// Refresh em andamento, compartilhado: requisições que levam 401 ao mesmo tempo
// aguardam o mesmo refresh e são repetidas, em vez de falharem.
let refreshPromise: Promise<unknown> | null = null;

const refreshSession = () => {
  refreshPromise ??= updateTokenInStorage()
    .catch(async (refreshError) => {
      // Sessão sem refresh possível: desloga uma única vez, não uma por requisição.
      if (
        refreshError instanceof Error &&
        (refreshError.message === 'No refresh token available' ||
          refreshError.message === 'Refresh token mode disabled' ||
          refreshError.message === REFRESH_REJECTED)
      ) {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY_STORAGE);
        onUnauthenticated?.();
      }
      throw refreshError;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

let onUnauthenticated: (() => void) | null = null;

const authOrigin = new URL(EXPO_PUBLIC_AUTH_URL).origin;

const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  timeout: 20000,
  adapter: 'fetch',
  headers: {
    Origin: authOrigin,
    Referer: authOrigin,
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    // Mesmos headers que o site do Cartola envia em toda chamada à API.
    'X-GLB-App': 'cartola_web',
    'X-GLB-Auth': 'oidc',
  },
});

// Função para registrar callback de desautenticação
export function setUnauthenticatedCallback(callback: () => void) {
  onUnauthenticated = callback;
}

api.interceptors.request.use(async (instance: InternalAxiosRequestConfig) => {
  const token = await getTokenFromStorage();
  if (token) {
    instance.headers.Authorization = `Bearer ${token}`;
    return instance;
  }

  return instance;
});

api.interceptors.response.use(
  async (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config;

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig.optionalAuth &&
      !originalConfig._retried &&
      // Sem token enviado não há sessão para renovar (ex.: requisição durante a saída)
      !!originalConfig.headers?.Authorization
    ) {
      originalConfig._retried = true;
      await refreshSession();
      return api(originalConfig);
    }
    return Promise.reject(error);
  }
);

// Diagnóstico (só em desenvolvimento): método, rota, status, tempo e tamanho da resposta.
// Nunca registra cabeçalhos nem token.
if (__DEV__) {
  const startedAt = new WeakMap<object, number>();

  const describe = (data: unknown) => {
    if (Array.isArray(data)) return `${data.length} itens`;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.atletas)) return `${record.atletas.length} atletas`;
      if (Array.isArray(record.partidas)) return `${record.partidas.length} partidas`;
      return `${Object.keys(record).length} chaves`;
    }
    return typeof data;
  };

  api.interceptors.request.use((config) => {
    startedAt.set(config, Date.now());
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      const ms = Date.now() - (startedAt.get(response.config) ?? Date.now());
      debugLog(
        'api',
        `${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status} em ${ms}ms (${describe(response.data)})`
      );
      return response;
    },
    (error: AxiosError) => {
      const ms = error.config ? Date.now() - (startedAt.get(error.config) ?? Date.now()) : 0;
      debugLog(
        'api',
        `${error.config?.method?.toUpperCase()} ${error.config?.url} → ERRO ${
          error.response?.status ?? 'sem resposta'
        } em ${ms}ms: ${error.message}`
      );
      return Promise.reject(error);
    }
  );
}

export default api;
