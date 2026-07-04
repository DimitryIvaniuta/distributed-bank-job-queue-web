import { WifiOff } from 'lucide-react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Makes paused network work visible. TanStack Query independently pauses online
 * queries and mutations until the browser reconnects.
 */
export function NetworkStatusBanner() {
  const online = useOnlineStatus();
  if (online) {
    return null;
  }

  return (
    <div className="network-banner" role="status" aria-live="polite">
      <WifiOff size={18} aria-hidden="true" />
      <span>
        <strong>You are offline.</strong> Reads and submissions will resume after connectivity is
        restored.
      </span>
    </div>
  );
}
