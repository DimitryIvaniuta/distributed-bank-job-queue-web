import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/FormField';
import { RequestError } from '../../components/ui/RequestError';
import { formatLocalDateInput } from '../../lib/format';
import { generateIdempotencyKey } from '../../lib/idempotency';
import { CommonJobFields } from './CommonJobFields';
import { SubmissionScaffold } from './SubmissionScaffold';
import {
  reconciliationFormSchema,
  type ReconciliationFormInput,
  type ReconciliationFormValues,
} from './submissionSchemas';
import { useJobSubmission } from './useJobSubmission';

export function ReconciliationSubmissionPage() {
  const submission = useJobSubmission();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReconciliationFormInput, unknown, ReconciliationFormValues>({
    resolver: zodResolver(reconciliationFormSchema),
    defaultValues: {
      tenantId: 'retail-bank',
      idempotencyKey: generateIdempotencyKey(),
      priority: 'LOW',
      maxAttempts: 5,
      accountId: 'ACC-RECON-3100',
      businessDate: formatLocalDateInput(),
    },
  });

  const submit = (values: ReconciliationFormValues): void => {
    submission.mutate({
      idempotencyKey: values.idempotencyKey,
      request: {
        tenantId: values.tenantId,
        type: 'ACCOUNT_RECONCILIATION',
        priority: values.priority,
        ...(values.maxAttempts === undefined ? {} : { maxAttempts: values.maxAttempts }),
        payload: { accountId: values.accountId, businessDate: values.businessDate },
      },
    });
  };

  return (
    <SubmissionScaffold
      eyebrow="Daily controls"
      title="Submit account reconciliation"
      description="Queue a daily balance verification using the low-priority worker lane by default."
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
              <h2>Reconciliation scope</h2>
              <p>Select the account and banking business date that form the unique business key.</p>
            </div>
          </div>
          <div className="form-grid form-grid--two">
            <InputField
              {...register('accountId')}
              label="Account ID"
              error={errors.accountId?.message}
              required
            />
            <InputField
              {...register('businessDate')}
              label="Business date"
              type="date"
              error={errors.businessDate?.message}
              required
            />
          </div>
        </div>
        {submission.error ? <RequestError error={submission.error} /> : null}
        <div className="form-actions">
          <span>
            <CalendarCheck size={17} /> One effect per account and business date.
          </span>
          <Button type="submit" loading={submission.isPending}>
            Submit reconciliation <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </SubmissionScaffold>
  );
}
