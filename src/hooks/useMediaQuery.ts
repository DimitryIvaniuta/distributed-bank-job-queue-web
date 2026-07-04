import { useCallback, useMemo, useSyncExternalStore } from 'react';

/** Subscribes to a CSS media query without effect-driven mirror state. */
export function useMediaQuery(query: string): boolean {
  const mediaQueryList = useMemo(
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query) : null),
    [query],
  );
  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      mediaQueryList?.addEventListener('change', onStoreChange);
      return () => mediaQueryList?.removeEventListener('change', onStoreChange);
    },
    [mediaQueryList],
  );
  const getSnapshot = useCallback(() => mediaQueryList?.matches ?? false, [mediaQueryList]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
