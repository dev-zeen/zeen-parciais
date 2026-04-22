import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';

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

  const handleSuccessAuth = useCallback(() => {
    setIsAutheticated(true);
  }, []);

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

  useEffect(() => {
    setUnauthenticatedCallback(() => {
      console.log('🔒 Session expired - logging out');
      handleLogout();
    });

    return () => setUnauthenticatedCallback(() => {});
  }, [handleLogout]);

  useEffect(() => {
    getItem().then((item) => {
      if (item) setIsAutheticated(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = useMemo(
    () => ({ isAutheticated, handleSuccessAuth, handleUnautenticated, handleLogout }),
    [isAutheticated, handleSuccessAuth, handleUnautenticated, handleLogout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
