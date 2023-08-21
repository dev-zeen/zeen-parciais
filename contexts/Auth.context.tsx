import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useEffect, useState } from 'react';

import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';

type AuthContextProps = {
  isAutheticated: boolean;
  handleSuccessAuth: () => void;
  handleUnautenticated: () => void;
};

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthContextProvider({ children }: { children: ReactNode }): ReactNode {
  const { getItem, removeItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [isAutheticated, setIsAutheticated] = useState(false);

  async function handleGetToken() {
    const token = await getItem().then((item) => {
      if (item) {
        setIsAutheticated(true);
      }
    });
    return token;
  }

  async function handleSuccessAuth() {
    setIsAutheticated(true);
  }

  async function handleUnautenticated() {
    await removeItem();
    setIsAutheticated(false);
  }

  useEffect(() => {
    if (!isAutheticated) {
      handleGetToken();
    }
  }, [handleGetToken, isAutheticated]);

  return (
    <AuthContext.Provider
      value={{
        isAutheticated,
        handleSuccessAuth,
        handleUnautenticated,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
