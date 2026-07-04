import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, KeyRound, Search } from 'lucide-react';
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

const idSchema = z.object({ jobId: z.uuid('Enter a valid job UUID') });
const keySchema = z.object({
  tenantId: z.string().trim().min(1).max(80),
  idempotencyKey: z.string().trim().min(1).max(160),
});

type IdValues = z.infer<typeof idSchema>;
type KeyValues = z.infer<typeof keySchema>;

export function JobSearchPage() {
  const navigate = useNavigate();
  const idForm = useForm<IdValues>({ resolver: zodResolver(idSchema) });
  const keyForm = useForm<KeyValues>({
    resolver: zodResolver(keySchema),
    defaultValues: { tenantId: 'retail-bank', idempotencyKey: '' },
  });

  const byKey = useMutation({
    mutationFn: (values: KeyValues) => jobsApi.findByKey(values.tenantId, values.idempotencyKey),
    onSuccess: (job) => {
      recentJobsStore.upsert(job);
      void navigate(`/jobs/${job.id}`);
    },
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Operations search"
        title="Find a submitted job"
        description="Inspect a job directly by UUID or recover it using its tenant-scoped idempotency key."
      />
      <div className="content-grid content-grid--equal">
        <Card>
          <CardHeader
            title="Search by job ID"
            description="Use the UUID returned in the original submission response."
          />
          <form
            className="stack-form"
            onSubmit={(event) =>
              void idForm.handleSubmit((values) => navigate(`/jobs/${values.jobId}`))(event)
            }
            noValidate
          >
            <InputField
              {...idForm.register('jobId')}
              label="Job UUID"
              placeholder="00000000-0000-0000-0000-000000000000"
              error={idForm.formState.errors.jobId?.message}
              required
            />
            <Button type="submit">
              <Search size={17} /> Inspect job
            </Button>
          </form>
        </Card>
        <Card>
          <CardHeader
            title="Search by idempotency key"
            description="The backend resolves the canonical job for the tenant and key."
          />
          <form
            className="stack-form"
            onSubmit={(event) => void keyForm.handleSubmit((values) => byKey.mutate(values))(event)}
            noValidate
          >
            <InputField
              {...keyForm.register('tenantId')}
              label="Tenant ID"
              error={keyForm.formState.errors.tenantId?.message}
              required
            />
            <InputField
              {...keyForm.register('idempotencyKey')}
              label="Idempotency key"
              error={keyForm.formState.errors.idempotencyKey?.message}
              required
            />
            {byKey.error ? <RequestError error={byKey.error} /> : null}
            <Button type="submit" loading={byKey.isPending}>
              <KeyRound size={17} /> Resolve job <ArrowRight size={17} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
