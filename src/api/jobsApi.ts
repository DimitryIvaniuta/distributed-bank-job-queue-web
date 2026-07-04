import { z } from 'zod';

import { requestJson } from './httpClient';
import {
  effectResponseSchema,
  healthResponseSchema,
  jobResponseSchema,
  type EffectResponse,
  type HealthResponse,
  type JobResponse,
} from './schemas';
import type { CreateJobRequest } from './types';

export const jobsApi = {
  submit: (
    request: CreateJobRequest,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<JobResponse> =>
    requestJson('/api/v1/jobs', jobResponseSchema, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    }),

  get: (jobId: string, signal?: AbortSignal): Promise<JobResponse> =>
    requestJson(`/api/v1/jobs/${encodeURIComponent(jobId)}`, jobResponseSchema, { signal }),

  findByKey: (
    tenantId: string,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<JobResponse> => {
    const params = new URLSearchParams({ tenantId, idempotencyKey });
    return requestJson(`/api/v1/jobs/by-key?${params.toString()}`, jobResponseSchema, { signal });
  },

  getEffect: (jobId: string, signal?: AbortSignal): Promise<EffectResponse> =>
    requestJson(`/api/v1/jobs/${encodeURIComponent(jobId)}/effect`, effectResponseSchema, {
      signal,
    }),

  replay: (jobId: string, signal?: AbortSignal): Promise<JobResponse> =>
    requestJson(`/api/v1/jobs/${encodeURIComponent(jobId)}/replay`, jobResponseSchema, {
      method: 'POST',
      signal,
    }),

  health: (signal?: AbortSignal): Promise<HealthResponse> =>
    requestJson('/actuator/health', healthResponseSchema, { signal, timeoutMs: 4_000 }),
};

export const uuidSchema = z.uuid('Enter a valid job UUID');
