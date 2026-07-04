import type { JobPriority, JobType } from './schemas';

export interface CreateJobRequest {
  tenantId: string;
  type: JobType;
  priority: JobPriority;
  payload: Record<string, unknown>;
  maxAttempts?: number;
}
