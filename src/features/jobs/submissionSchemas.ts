import { z } from 'zod';

const idempotencyKey = z
  .string()
  .trim()
  .min(8, 'Use at least 8 characters')
  .max(160, 'Use at most 160 characters');

const tenantId = z.string().trim().min(1, 'Tenant ID is required').max(80);
const maxAttempts = z
  .union([z.literal(''), z.coerce.number().int().min(1).max(20)])
  .transform((value) => (value === '' ? undefined : value));

export const transferFormSchema = z
  .object({
    tenantId,
    idempotencyKey,
    priority: z.enum(['HIGH', 'LOW']),
    maxAttempts,
    transferId: z.string().trim().min(1, 'Transfer ID is required').max(150),
    debitAccountId: z.string().trim().min(1, 'Debit account is required').max(160),
    creditAccountId: z.string().trim().min(1, 'Credit account is required').max(160),
    amount: z
      .string()
      .trim()
      .regex(/^\d{1,10}(?:\.\d{1,2})?$/, 'Enter a positive amount with up to 2 decimals')
      .refine((value) => Number(value) > 0, 'Amount must be positive'),
    currency: z
      .string()
      .trim()
      .length(3, 'Use a 3-letter currency code')
      .transform((v) => v.toUpperCase()),
    transientFailuresBeforeSuccess: z.coerce.number().int().min(0).max(10),
    fatalFailure: z.boolean(),
  })
  .refine((values) => values.debitAccountId !== values.creditAccountId, {
    path: ['creditAccountId'],
    message: 'Credit and debit accounts must differ',
  });

export const reconciliationFormSchema = z.object({
  tenantId,
  idempotencyKey,
  priority: z.enum(['HIGH', 'LOW']),
  maxAttempts,
  accountId: z.string().trim().min(1, 'Account ID is required').max(120),
  businessDate: z.iso.date('Enter a valid business date'),
});

export const statementFormSchema = z.object({
  tenantId,
  idempotencyKey,
  priority: z.enum(['HIGH', 'LOW']),
  maxAttempts,
  customerId: z.string().trim().min(1, 'Customer ID is required').max(100),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Enter a valid statement month'),
});

export type TransferFormInput = z.input<typeof transferFormSchema>;
export type TransferFormValues = z.output<typeof transferFormSchema>;
export type ReconciliationFormInput = z.input<typeof reconciliationFormSchema>;
export type ReconciliationFormValues = z.output<typeof reconciliationFormSchema>;
export type StatementFormInput = z.input<typeof statementFormSchema>;
export type StatementFormValues = z.output<typeof statementFormSchema>;
