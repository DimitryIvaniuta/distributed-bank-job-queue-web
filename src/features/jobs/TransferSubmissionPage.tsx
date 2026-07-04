import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/FormField';
import { RequestError } from '../../components/ui/RequestError';
import { generateIdempotencyKey } from '../../lib/idempotency';
import { CommonJobFields } from './CommonJobFields';
import { SubmissionScaffold } from './SubmissionScaffold';
import {
  transferFormSchema,
  type TransferFormInput,
  type TransferFormValues,
} from './submissionSchemas';
import { useJobSubmission } from './useJobSubmission';

export function TransferSubmissionPage() {
  const submission = useJobSubmission();
  const [initialTransferId] = useState(() => `TRF-${Date.now()}`);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TransferFormInput, unknown, TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      tenantId: 'retail-bank',
      idempotencyKey: generateIdempotencyKey(),
      priority: 'HIGH',
      maxAttempts: 5,
      transferId: initialTransferId,
      debitAccountId: 'ACC-DEBIT-1001',
      creditAccountId: 'ACC-CREDIT-2001',
      amount: '1250.00',
      currency: 'EUR',
      transientFailuresBeforeSuccess: 0,
      fatalFailure: false,
    },
  });

  const submit = (values: TransferFormValues): void => {
    submission.mutate({
      idempotencyKey: values.idempotencyKey,
      request: {
        tenantId: values.tenantId,
        type: 'TRANSFER_SETTLEMENT',
        priority: values.priority,
        ...(values.maxAttempts === undefined ? {} : { maxAttempts: values.maxAttempts }),
        payload: {
          transferId: values.transferId,
          debitAccountId: values.debitAccountId,
          creditAccountId: values.creditAccountId,
          amount: Number(values.amount),
          currency: values.currency,
          transientFailuresBeforeSuccess: values.transientFailuresBeforeSuccess,
          fatalFailure: values.fatalFailure,
        },
      },
    });
  };

  return (
    <SubmissionScaffold
      eyebrow="High-priority banking operation"
      title="Submit transfer settlement"
      description="Queue an exactly-once settlement side effect with controlled retry simulation."
    >
      <form onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
        <CommonJobFields
          tenantRegistration={register('tenantId')}
          tenantError={errors.tenantId}
          keyRegistration={register('idempotencyKey')}
          keyError={errors.idempotencyKey}
          priorityRegistration={register('priority')}
          priorityError={errors.priority}
          maxAttemptsRegistration={register('maxAttempts')}
          maxAttemptsError={errors.maxAttempts}
          onRegenerateKey={() =>
            setValue('idempotencyKey', generateIdempotencyKey(), { shouldValidate: true })
          }
        />

        <div className="form-section">
          <div className="form-section__heading">
            <span>02</span>
            <div>
              <h2>Settlement instruction</h2>
              <p>Provide the immutable transfer identity and the accounts involved.</p>
            </div>
          </div>
          <div className="form-grid form-grid--two">
            <InputField
              {...register('transferId')}
              label="Transfer ID"
              error={errors.transferId?.message}
              required
            />
            <InputField
              {...register('amount')}
              label="Amount"
              error={errors.amount?.message}
              inputMode="decimal"
              required
            />
            <InputField
              {...register('debitAccountId')}
              label="Debit account ID"
              error={errors.debitAccountId?.message}
              required
            />
            <InputField
              {...register('creditAccountId')}
              label="Credit account ID"
              error={errors.creditAccountId?.message}
              required
            />
            <InputField
              {...register('currency')}
              label="Currency"
              error={errors.currency?.message}
              maxLength={3}
              required
            />
            <InputField
              {...register('transientFailuresBeforeSuccess')}
              label="Transient failures before success"
              type="number"
              min={0}
              max={10}
              error={errors.transientFailuresBeforeSuccess?.message}
              hint="Testing control: 0 executes normally; 1–10 demonstrates retries."
              required
            />
          </div>
          <label className="checkbox-card">
            <input type="checkbox" {...register('fatalFailure')} />
            <span className="checkbox-card__control" aria-hidden="true" />
            <span>
              <strong>Simulate permanent validation failure</strong>
              <small>
                The worker sends this job directly toward terminal dead-letter handling.
              </small>
            </span>
          </label>
        </div>

        {submission.error ? <RequestError error={submission.error} /> : null}
        <div className="form-actions">
          <span>
            <Landmark size={17} /> Side effects are committed atomically in PostgreSQL.
          </span>
          <Button type="submit" loading={submission.isPending}>
            Submit settlement <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </SubmissionScaffold>
  );
}
