import { QueryClient } from '@tanstack/react-query';

import { ApiClientError } from '../api/httpClient';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      gcTime: 10 * 60_000,
      networkMode: 'online',
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
    },
    mutations: {
      networkMode: 'online',
      retry: false,
    },
  },
});
