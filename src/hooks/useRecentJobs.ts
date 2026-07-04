import { useSyncExternalStore } from 'react';

import { recentJobsStore } from '../lib/recentJobsStore';

export function useRecentJobs() {
  return useSyncExternalStore(recentJobsStore.subscribe, recentJobsStore.getSnapshot, () => []);
}
