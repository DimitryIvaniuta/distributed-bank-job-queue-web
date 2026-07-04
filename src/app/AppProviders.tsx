import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ToastProvider } from '../components/feedback/ToastProvider';
import { queryClient } from './queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
