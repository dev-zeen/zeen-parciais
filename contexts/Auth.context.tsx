import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, createContext, useCallback, useEffect, useState } from 'react';

import { ACCESS_TOKEN_KEY_STORAGE } from '@/constants/Keys';
import { clearGloboidClientSettings } from '@/lib/core/auth';
import { setUnauthenticatedCallback } from '@/services/api';
import useTeamLineupStore from '@/store/useTeamLineupStore';

type AuthContextProps = {
  isAutheticated: boolean;
  handleSuccessAuth: () => void;
  handleUnautenticated: () => void;
  handleLogout: () => void;
};

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthContextProvider({ children }: { children: ReactNode }): ReactNode {
  const { getItem, removeItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

  const [isAutheticated, setIsAutheticated] = useState(false);

  const queryClient = useQueryClient();

  const resetStore = useTeamLineupStore((state) => state.reset);

  async function handleSuccessAuth() {
    setIsAutheticated(true);
  }

  const handleUnautenticated = useCallback(async () => {
    await removeItem();
    await clearGloboidClientSettings();
    setIsAutheticated(false);
  }, [removeItem]);

  const handleLogout = useCallback(() => {
    resetStore();
    queryClient.clear();
    handleUnautenticated();
  }, [handleUnautenticated, queryClient, resetStore]);

  // Registra callback de desautenticação no interceptor da API
  useEffect(() => {
    setUnauthenticatedCallback(() => {
      console.log('🔒 Session expired - logging out');
      handleLogout();
    });
  }, [handleLogout]);

  useEffect(() => {
    function handleGetToken() {
      const token = getItem().then((item) => {
        if (item) {
          setIsAutheticated(true);
        }
      });
      return token;
    }

    if (!isAutheticated) {
      handleGetToken();
    }
  }, [getItem, isAutheticated]);

  return (
    <AuthContext.Provider
      value={{
        isAutheticated,
        handleSuccessAuth,
        handleUnautenticated,
        handleLogout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
