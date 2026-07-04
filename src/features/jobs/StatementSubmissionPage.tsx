import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/FormField';
import { RequestError } from '../../components/ui/RequestError';
import { formatLocalMonthInput } from '../../lib/format';
import { generateIdempotencyKey } from '../../lib/idempotency';
import { CommonJobFields } from './CommonJobFields';
import { SubmissionScaffold } from './SubmissionScaffold';
import {
  statementFormSchema,
  type StatementFormInput,
  type StatementFormValues,
} from './submissionSchemas';
import { useJobSubmission } from './useJobSubmission';

export function StatementSubmissionPage() {
  const submission = useJobSubmission();
  const currentMonth = formatLocalMonthInput();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StatementFormInput, unknown, StatementFormValues>({
    resolver: zodResolver(statementFormSchema),
    defaultValues: {
      tenantId: 'retail-bank',
      idempotencyKey: generateIdempotencyKey(),
      priority: 'LOW',
      maxAttempts: 5,
      customerId: 'CUS-100320',
      period: currentMonth,
    },
  });

  const submit = (values: StatementFormValues): void => {
    submission.mutate({
      idempotencyKey: values.idempotencyKey,
      request: {
        tenantId: values.tenantId,
        type: 'STATEMENT_GENERATION',
        priority: values.priority,
        ...(values.maxAttempts === undefined ? {} : { maxAttempts: values.maxAttempts }),
        payload: { customerId: values.customerId, period: values.period },
      },
    });
  };

  return (
    <SubmissionScaffold
      eyebrow="Customer documents"
      title="Submit statement generation"
      description="Queue a monthly statement artifact and inspect its committed storage reference."
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
              <h2>Statement parameters</h2>
              <p>The customer and month together form the idempotent business identity.</p>
            </div>
          </div>
          <div className="form-grid form-grid--two">
            <InputField
              {...register('customerId')}
              label="Customer ID"
              error={errors.customerId?.message}
              required
            />
            <InputField
              {...register('period')}
              label="Statement period"
              type="month"
              error={errors.period?.message}
              required
            />
          </div>
        </div>
        {submission.error ? <RequestError error={submission.error} /> : null}
        <div className="form-actions">
          <span>
            <FileCheck2 size={17} /> The artifact URI is available after success.
          </span>
          <Button type="submit" loading={submission.isPending}>
            Submit statement <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </SubmissionScaffold>
  );
}
