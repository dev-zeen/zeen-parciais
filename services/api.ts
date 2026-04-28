import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { EXPO_PUBLIC_API_URL } from '@/constants/Endpoits';
import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { getTokenFromStorage, updateTokenInStorage } from '@/lib/core/auth';

let isRefreshing = false;
let onUnauthenticated: (() => void) | null = null;

const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  timeout: 20000,
  adapter: 'fetch',
  headers: {
    Origin: 'https://cartola.globo.com',
    Referer: 'https://cartola.globo.com/',
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

    if (error.response && error.response.status === 401 && originalConfig && !isRefreshing) {
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

export default api;
