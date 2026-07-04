import { z } from 'zod';

export const jobTypeSchema = z.enum([
  'TRANSFER_SETTLEMENT',
  'ACCOUNT_RECONCILIATION',
  'STATEMENT_GENERATION',
]);

export const jobPrioritySchema = z.enum(['HIGH', 'LOW']);
export const jobStatusSchema = z.enum([
  'PENDING',
  'QUEUED',
  'PROCESSING',
  'RETRYING',
  'SUCCEEDED',
  'DEAD_LETTERED',
]);

export const jobResponseSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  idempotencyKey: z.string(),
  type: jobTypeSchema,
  priority: jobPrioritySchema,
  status: jobStatusSchema,
  attempt: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  lastError: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  deduplicated: z.boolean(),
});

export const effectResponseSchema = z.object({
  id: z.uuid(),
  jobId: z.uuid(),
  effectType: z.string(),
  businessKey: z.string(),
  externalReference: z.string(),
  details: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
});

export const apiErrorSchema = z.object({
  timestamp: z.iso.datetime(),
  status: z.number().int(),
  error: z.string(),
  details: z.array(z.string()),
  path: z.string(),
});

export const healthResponseSchema = z.object({
  status: z.string(),
  components: z.record(z.string(), z.unknown()).optional(),
});

export type JobType = z.infer<typeof jobTypeSchema>;
export type JobPriority = z.infer<typeof jobPrioritySchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type JobResponse = z.infer<typeof jobResponseSchema>;
export type EffectResponse = z.infer<typeof effectResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
