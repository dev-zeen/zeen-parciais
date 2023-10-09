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
      },
    },
  });

  return (
    // <ErrorBoundary
    //   FallbackComponent={(props) => (
    //     <ErrorBoundaryComponent
    //       error={props.error as AxiosError<Error>}
    //       resetError={props.resetError}
    //     />
    //   )}>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </QueryClientProvider>
    // </ErrorBoundary>
  );
}
