import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: readonly (readonly [RegExp, string])[] = [
  [/^\/$/, 'Dashboard'],
  [/^\/jobs\/transfer$/, 'Transfer settlement'],
  [/^\/jobs\/reconciliation$/, 'Account reconciliation'],
  [/^\/jobs\/statement$/, 'Statement generation'],
  [/^\/jobs\/recent$/, 'Recent jobs'],
  [/^\/jobs\/search$/, 'Find a job'],
  [/^\/jobs\/[^/]+$/, 'Job details'],
  [/^\/operations\/replay$/, 'Replay dead letter'],
  [/^\/system$/, 'System status'],
];

function titleFor(pathname: string): string {
  return routeTitles.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'Page not found';
}

/** Updates browser title and announces client-side navigation to assistive technology. */
export function RouteMeta() {
  const location = useLocation();
  const firstRender = useRef(true);
  const title = titleFor(location.pathname);

  useEffect(() => {
    document.title = `${title} · BankFlow Queue Console`;

    if (!firstRender.current) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    firstRender.current = false;
  }, [title]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {title} page loaded
    </div>
  );
}
