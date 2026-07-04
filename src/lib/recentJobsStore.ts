import { z } from 'zod';

import type { JobResponse } from '../api/schemas';

const storageKey = 'bankflow.recent-jobs.v1';
const changeEventName = 'bankflow:recent-jobs-changed';
const maxEntries = 24;

const recentJobSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  type: z.enum(['TRANSFER_SETTLEMENT', 'ACCOUNT_RECONCILIATION', 'STATEMENT_GENERATION']),
  priority: z.enum(['HIGH', 'LOW']),
  status: z.enum(['PENDING', 'QUEUED', 'PROCESSING', 'RETRYING', 'SUCCEEDED', 'DEAD_LETTERED']),
  attempt: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const recentJobsSchema = z.array(recentJobSchema);
export type RecentJob = z.infer<typeof recentJobSchema>;

/**
 * React's useSyncExternalStore requires getSnapshot to return the same object
 * until the underlying store changes. The cache also avoids reparsing storage
 * on every render while still detecting browser storage events from other tabs.
 */
let cachedRaw: string | null | undefined;
let cachedSnapshot: RecentJob[] = [];

function notifySubscribers(): void {
  window.dispatchEvent(new Event(changeEventName));
}

function updateCache(raw: string | null, snapshot: RecentJob[]): RecentJob[] {
  cachedRaw = raw;
  cachedSnapshot = snapshot;
  return cachedSnapshot;
}

function readStorage(): RecentJob[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === cachedRaw) {
      return cachedSnapshot;
    }
    if (raw === null) {
      return updateCache(null, []);
    }
    const parsed = recentJobsSchema.safeParse(JSON.parse(raw) as unknown);
    return updateCache(raw, parsed.success ? parsed.data : []);
  } catch {
    return updateCache(null, []);
  }
}

function writeStorage(jobs: RecentJob[]): void {
  try {
    const next = jobs.slice(0, maxEntries);
    const raw = JSON.stringify(next);
    window.localStorage.setItem(storageKey, raw);
    updateCache(raw, next);
    notifySubscribers();
  } catch {
    // Storage is an optional convenience only; queue correctness remains server-side.
  }
}

export function toRecentJob(job: JobResponse): RecentJob {
  return {
    id: job.id,
    tenantId: job.tenantId,
    type: job.type,
    priority: job.priority,
    status: job.status,
    attempt: job.attempt,
    maxAttempts: job.maxAttempts,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export const recentJobsStore = {
  getSnapshot: (): RecentJob[] => readStorage(),

  subscribe: (onStoreChange: () => void): (() => void) => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === storageKey) {
        // Invalidate the cache before React requests a new snapshot.
        cachedRaw = undefined;
        onStoreChange();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(changeEventName, onStoreChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(changeEventName, onStoreChange);
    };
  },

  upsert: (job: JobResponse): void => {
    const entry = toRecentJob(job);
    const current = readStorage().filter((item) => item.id !== job.id);
    writeStorage([entry, ...current]);
  },

  clear: (): void => {
    try {
      window.localStorage.removeItem(storageKey);
      updateCache(null, []);
      notifySubscribers();
    } catch {
      // Ignore unavailable storage; this action does not affect server data.
    }
  },
};
