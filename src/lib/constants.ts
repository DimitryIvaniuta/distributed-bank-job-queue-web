import type { JobStatus, JobType } from '../api/schemas';

export const ACTIVE_JOB_STATUSES: readonly JobStatus[] = [
  'PENDING',
  'QUEUED',
  'PROCESSING',
  'RETRYING',
];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  TRANSFER_SETTLEMENT: 'Transfer settlement',
  ACCOUNT_RECONCILIATION: 'Account reconciliation',
  STATEMENT_GENERATION: 'Statement generation',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending',
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  RETRYING: 'Retrying',
  SUCCEEDED: 'Succeeded',
  DEAD_LETTERED: 'Dead-lettered',
};
