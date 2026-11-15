import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_AUTH_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { getTokenFromStorage, updateTokenInStorage } from '@/lib/core/auth';
import { debugLog } from '@/utils/debugLog';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Rota cujo 401 não significa sessão expirada (ex.: recurso PRO).
     * O erro volta para quem chamou, sem tentar refresh nem deslogar.
     */
    optionalAuth?: boolean;
  }
}

let isRefreshing = false;

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
      error.response &&
      error.response.status === 401 &&
      originalConfig &&
      !originalConfig.optionalAuth &&
      // Sem token enviado não há sessão para renovar (ex.: requisição durante a saída)
      !!originalConfig.headers?.Authorization &&
      !isRefreshing
    ) {
      isRefreshing = true;
      try {
        await updateTokenInStorage();
        isRefreshing = false;
        return await api(originalConfig);
      } catch (refreshError) {
        isRefreshing = false;

        // Se o erro for "No refresh token available" ou "Refresh token mode disabled"
        if (refreshError instanceof Error) {
          if (
            refreshError.message === 'No refresh token available' ||
            refreshError.message === 'Refresh token mode disabled'
          ) {
            console.log('Reason:', refreshError.message);
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY_STORAGE);

            // Chama callback de desautenticação se estiver registrado
            if (onUnauthenticated) {
              onUnauthenticated();
            }
          }
        }

        return Promise.reject(refreshError);
      }
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
