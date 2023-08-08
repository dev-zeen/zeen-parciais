import { ReactNode } from "react";
import ErrorBoundary from "react-native-error-boundary";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ErrorBoundaryComponent } from "@/components/structure/ErrorBoundary";
import { AuthContextProvider } from "@/contexts/Auth.context";
import { AxiosError } from "axios";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps): ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        useErrorBoundary: true,
      },
    },
  });

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <ErrorBoundaryComponent
          error={props.error as AxiosError<Error>}
          resetError={props.resetError}
        />
      )}
      onError={(error) => console.log(error.cause)}
    >
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  );
}
