import axios, { InternalAxiosRequestConfig } from 'axios';

import { getTokenFromStorage } from '@/lib/core/auth';

const cartolaApi = axios.create({
  baseURL: 'https://api.cartola.globo.com',
});

cartolaApi.interceptors.request.use(async (instance: InternalAxiosRequestConfig) => {
  const token = await getTokenFromStorage();
  if (token) {
    console.log(instance.url);

    instance.headers.Authorization = `Bearer ${token}`;
    instance.timeout = 10000;
    return instance;
  }

  return instance;
});

export default cartolaApi;
