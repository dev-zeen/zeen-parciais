import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { AuthContextProvider } from '@/contexts/Auth.context';
import { ThemeContextProvider } from '@/contexts/Theme.context';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        useErrorBoundary: true,
        refetchOnReconnect: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <AuthContextProvider>{children}</AuthContextProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}
