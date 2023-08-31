import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';

type RefreshTokenProps = {
  access_token: string;
};

export async function getTokenFromStorage(): Promise<string | null> {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY_STORAGE);
  return token;
}

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY_STORAGE, token);
}

export async function refreshToken() {
  const token = await getTokenFromStorage();

  const response = await axios.post<RefreshTokenProps>('https://api.cartola.globo.com/refresh', {
    access_token: token,
  });

  return response.data;
}

export async function updateTokenInStorage(): Promise<RefreshTokenProps> {
  try {
    const data = await refreshToken();

    await setAuthToken(data.access_token);

    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}
