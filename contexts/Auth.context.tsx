import { ReactNode, createContext, useEffect, useState } from "react";

import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

type AuthContextProps = {
  isAutheticated: boolean;
  handleSuccessAuth: () => void;
  handleUnautenticated: () => void;
};

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

export function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const { getItem } = useAsyncStorage(ACCESS_TOKEN_KEY_STORAGE);

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
    setIsAutheticated(false);
  }

  useEffect(() => {
    if (!isAutheticated) {
      handleGetToken();
    }
  }, [isAutheticated]);

  return (
    <AuthContext.Provider
      value={{
        isAutheticated,
        handleSuccessAuth,
        handleUnautenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
