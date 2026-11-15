import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthContextProvider } from '@/contexts/Auth.context';
import { ThemeContextProvider } from '@/contexts/Theme.context';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps): ReactNode {
  // Um único cliente durante toda a vida do app. Criado no render (sem useState),
  // cada re-render do layout raiz descartava o cache e todas as consultas.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnReconnect: true,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <AuthContextProvider>{children}</AuthContextProvider>
        </ThemeContextProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
