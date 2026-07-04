import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ToastContext } from './toastContext';

interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'error';
}

const MAX_VISIBLE_TOASTS = 4;
const AUTO_DISMISS_MS = 5_000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = crypto.randomUUID();
      setToasts((items) => {
        const withoutDuplicate = items.filter(
          (item) => item.message !== message || item.tone !== tone,
        );
        return [...withoutDuplicate, { id, message, tone }].slice(-MAX_VISIBLE_TOASTS);
      });
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) {
        window.clearTimeout(timer);
      }
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            className={`toast toast--${toast.tone}`}
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            {toast.tone === 'success' ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
            <span>{toast.message}</span>
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
