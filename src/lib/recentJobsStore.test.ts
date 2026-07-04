import type { JobResponse } from '../api/schemas';
import { recentJobsStore, toRecentJob } from './recentJobsStore';

const job: JobResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  tenantId: 'retail-bank',
  idempotencyKey: 'secret-key-not-persisted',
  type: 'TRANSFER_SETTLEMENT',
  priority: 'HIGH',
  status: 'QUEUED',
  attempt: 0,
  maxAttempts: 5,
  lastError: null,
  createdAt: '2026-06-28T12:00:00Z',
  updatedAt: '2026-06-28T12:00:01Z',
  completedAt: null,
  deduplicated: false,
};

describe('recentJobsStore', () => {
  it('removes the idempotency key and error details from persisted metadata', () => {
    const recent = toRecentJob(job);
    expect(recent).not.toHaveProperty('idempotencyKey');
    expect(recent).not.toHaveProperty('lastError');
  });

  it('upserts and reorders updated jobs', () => {
    recentJobsStore.upsert(job);
    recentJobsStore.upsert({ ...job, status: 'SUCCEEDED', updatedAt: '2026-06-28T12:00:05Z' });

    expect(recentJobsStore.getSnapshot()).toHaveLength(1);
    expect(recentJobsStore.getSnapshot()[0]?.status).toBe('SUCCEEDED');
  });

  it('returns a stable snapshot until storage changes', () => {
    recentJobsStore.upsert(job);
    const first = recentJobsStore.getSnapshot();
    const second = recentJobsStore.getSnapshot();

    expect(second).toBe(first);
  });

  it('ignores corrupted local storage', () => {
    window.localStorage.setItem('bankflow.recent-jobs.v1', '{bad-json');
    expect(recentJobsStore.getSnapshot()).toEqual([]);
  });

  it('clears only the local history', () => {
    recentJobsStore.upsert(job);
    recentJobsStore.clear();
    expect(recentJobsStore.getSnapshot()).toEqual([]);
  });
});
