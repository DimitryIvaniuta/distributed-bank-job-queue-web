import {
  reconciliationFormSchema,
  statementFormSchema,
  transferFormSchema,
} from './submissionSchemas';

describe('job submission schemas', () => {
  it('normalizes a valid transfer form', () => {
    const result = transferFormSchema.parse({
      tenantId: 'retail-bank',
      idempotencyKey: 'key-12345678',
      priority: 'HIGH',
      maxAttempts: '5',
      transferId: 'TRF-1',
      debitAccountId: 'ACC-1',
      creditAccountId: 'ACC-2',
      amount: '1250.50',
      currency: 'eur',
      transientFailuresBeforeSuccess: '2',
      fatalFailure: false,
    });

    expect(result).toMatchObject({
      currency: 'EUR',
      maxAttempts: 5,
      transientFailuresBeforeSuccess: 2,
    });
  });

  it('rejects identical debit and credit accounts', () => {
    const result = transferFormSchema.safeParse({
      tenantId: 'retail-bank',
      idempotencyKey: 'key-12345678',
      priority: 'HIGH',
      maxAttempts: '',
      transferId: 'TRF-1',
      debitAccountId: 'ACC-1',
      creditAccountId: 'ACC-1',
      amount: '10.00',
      currency: 'EUR',
      transientFailuresBeforeSuccess: 0,
      fatalFailure: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['creditAccountId']);
    }
  });

  it('rejects an unsafe amount shape', () => {
    const result = transferFormSchema.safeParse({
      tenantId: 'retail-bank',
      idempotencyKey: 'key-12345678',
      priority: 'HIGH',
      maxAttempts: 5,
      transferId: 'TRF-1',
      debitAccountId: 'ACC-1',
      creditAccountId: 'ACC-2',
      amount: '12.999',
      currency: 'EUR',
      transientFailuresBeforeSuccess: 0,
      fatalFailure: false,
    });
    expect(result.success).toBe(false);
  });

  it('validates reconciliation business dates', () => {
    expect(
      reconciliationFormSchema.safeParse({
        tenantId: 'retail-bank',
        idempotencyKey: 'key-12345678',
        priority: 'LOW',
        maxAttempts: 5,
        accountId: 'ACC-1',
        businessDate: '2026-06-28',
      }).success,
    ).toBe(true);
    expect(
      reconciliationFormSchema.safeParse({
        tenantId: 'retail-bank',
        idempotencyKey: 'key-12345678',
        priority: 'LOW',
        maxAttempts: 5,
        accountId: 'ACC-1',
        businessDate: '28-06-2026',
      }).success,
    ).toBe(false);
  });

  it('validates a YearMonth statement period', () => {
    expect(
      statementFormSchema.safeParse({
        tenantId: 'retail-bank',
        idempotencyKey: 'key-12345678',
        priority: 'LOW',
        maxAttempts: '',
        customerId: 'CUS-1',
        period: '2026-06',
      }).success,
    ).toBe(true);
    expect(
      statementFormSchema.safeParse({
        tenantId: 'retail-bank',
        idempotencyKey: 'key-12345678',
        priority: 'LOW',
        maxAttempts: '',
        customerId: 'CUS-1',
        period: '2026-13',
      }).success,
    ).toBe(false);
  });
});
