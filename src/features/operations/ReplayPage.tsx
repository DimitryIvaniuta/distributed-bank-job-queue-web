import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { jobsApi } from '../../api/jobsApi';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { InputField } from '../../components/ui/FormField';
import { RequestError } from '../../components/ui/RequestError';
import { PageHeader } from '../../components/ui/PageHeader';
import { recentJobsStore } from '../../lib/recentJobsStore';

const schema = z.object({ jobId: z.uuid('Enter a valid dead-lettered job UUID') });
type Values = z.infer<typeof schema>;

export function ReplayPage() {
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const replay = useMutation({
    mutationFn: ({ jobId }: Values) => jobsApi.replay(jobId),
    onSuccess: (job) => {
      recentJobsStore.upsert(job);
      void navigate(`/jobs/${job.id}`);
    },
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Dead-letter operations"
        title="Replay a terminal job"
        description="Requeue a corrected or recoverable dead-lettered job without changing its business idempotency key."
      />
      <div className="content-grid content-grid--form">
        <Card>
          <CardHeader
            title="Replay request"
            description="The backend permits replay only from the dead-lettered state."
          />
          <form
            className="stack-form"
            onSubmit={(event) => void form.handleSubmit((values) => replay.mutate(values))(event)}
            noValidate
          >
            <InputField
              {...form.register('jobId')}
              label="Dead-lettered job UUID"
              error={form.formState.errors.jobId?.message}
              required
            />
            {replay.error ? <RequestError error={replay.error} /> : null}
            <Button type="submit" tone="danger" loading={replay.isPending}>
              <RefreshCcw size={18} /> Replay job
            </Button>
          </form>
        </Card>
        <aside className="guidance-card guidance-card--warning">
          <div className="guidance-card__icon">
            <ShieldAlert size={22} />
          </div>
          <span className="eyebrow">Operator control</span>
          <h2>Replay is not a duplicate side effect</h2>
          <p>
            The backend reuses the original business identity. PostgreSQL uniqueness still prevents
            a second committed effect.
          </p>
          <ul className="check-list">
            <li>Investigate and correct permanent causes first.</li>
            <li>Replay creates a new outbox publication attempt.</li>
            <li>Audit the resulting job state and committed effect.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
