import { ReactNode } from "react";
import ErrorBoundary from "react-native-error-boundary";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CustomFallbackErrorBoundary } from "@/components/structure/ErrorBoundary";
import { AuthContextProvider } from "@/contexts/Auth.context";

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
      FallbackComponent={(props) => <CustomFallbackErrorBoundary {...props} />}
    >
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthContextProvider>
      //{" "}
    </ErrorBoundary>
  );
}
