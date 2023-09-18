import { EXPO_PUBLIC_API_URL } from '@env';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getTokenFromStorage, updateTokenInStorage } from '@/lib/core/auth';

let isRefreshing = false;

const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (instance: InternalAxiosRequestConfig) => {
  const token = await getTokenFromStorage();
  if (token) {
    instance.headers.Authorization = `Bearer ${token}`;
    instance.timeout = 10000;
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
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
