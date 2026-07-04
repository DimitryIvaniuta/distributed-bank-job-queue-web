import { createContext } from 'react';

export interface ToastContextValue {
  pushToast: (message: string, tone?: 'success' | 'error') => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
