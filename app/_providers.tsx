import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { AuthContextProvider } from '@/contexts/Auth.context';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        useErrorBoundary: true,
        refetchOnReconnect: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </QueryClientProvider>
  );
}
