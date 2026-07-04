import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const themeKey = 'bankflow.theme';

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(themeKey);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#071a2c' : '#0a2744');
}

function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(themeKey, theme);
  } catch {
    // Theme persistence is optional when storage is unavailable or blocked.
  }
}

/** Manages a resilient theme preference and synchronizes it across browser tabs. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onStorage = (event: StorageEvent): void => {
      if (event.key === themeKey) {
        setTheme(readStoredTheme() ?? systemTheme());
      }
    };
    const onSystemTheme = (): void => {
      if (readStoredTheme() === null) {
        setTheme(systemTheme());
      }
    };

    window.addEventListener('storage', onStorage);
    media.addEventListener('change', onSystemTheme);
    return () => {
      window.removeEventListener('storage', onStorage);
      media.removeEventListener('change', onSystemTheme);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
