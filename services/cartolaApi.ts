import axios, { InternalAxiosRequestConfig } from "axios";

import { getTokenFromStorage } from "@/lib/core/auth";

const cartolaApi = axios.create({
  baseURL: "https://api.cartola.globo.com",
});

cartolaApi.interceptors.request.use(
  async (instance: InternalAxiosRequestConfig) => {
    const token = await getTokenFromStorage();

    if (token) {
      instance.headers.Authorization = `Bearer ${token}`;
      return instance;
    }

    return instance;
  }
);

export default cartolaApi;
