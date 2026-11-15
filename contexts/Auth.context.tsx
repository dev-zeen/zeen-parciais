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
    // Antes de limpar o token: assim as consultas da conta (enabled por `allowRequest`)
    // já estão desligadas e não disparam requisições sem token no meio da saída.
    setIsAutheticated(false);
    await removeItem();
    await clearGloboidClientSettings();
  }, [removeItem]);

  const handleLogout = useCallback(() => {
    resetStore();
    // Remove só o que é da conta (rotas /auth/...). `clear()` apagava também o mercado e
    // as partidas, e as telas abertas ficavam carregando para sempre, sem buscar de novo.
    const isAccountQuery = ({ queryKey }: { queryKey: readonly unknown[] }) =>
      typeof queryKey[0] === 'string' && /^\/?auth\//.test(queryKey[0]);
    // Desliga primeiro, para a remoção do cache não fazer as telas buscarem de novo.
    handleUnautenticated();
    queryClient.cancelQueries({ predicate: isAccountQuery });
    queryClient.removeQueries({ predicate: isAccountQuery });
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
