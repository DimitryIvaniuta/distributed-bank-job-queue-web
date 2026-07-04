import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Clipboard,
  Clock3,
  DatabaseZap,
  Eye,
  EyeOff,
  RefreshCcw,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { jobsApi, uuidSchema } from '../../api/jobsApi';
import type { JobResponse } from '../../api/schemas';
import { queryClient } from '../../app/queryClient';
import { useToast } from '../../components/feedback/useToast';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { InlineError } from '../../components/ui/InlineError';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { RequestError } from '../../components/ui/RequestError';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { copyText } from '../../lib/clipboard';
import { JOB_TYPE_LABELS } from '../../lib/constants';
import { formatDateTime, formatRelativeTime } from '../../lib/format';
import { recentJobsStore } from '../../lib/recentJobsStore';

const lifecycle = ['PENDING', 'QUEUED', 'PROCESSING', 'SUCCEEDED'] as const;

type CopiedValue = 'job' | 'key' | null;

export function JobDetailPage() {
  const { jobId = '' } = useParams();
  const validId = uuidSchema.safeParse(jobId).success;
  const { pushToast } = useToast();
  const [copiedValue, setCopiedValue] = useState<CopiedValue>(null);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  const jobQuery = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: ({ signal }) => jobsApi.get(jobId, signal),
    enabled: validId,
    refetchInterval: (query) => pollingInterval(query.state.data),
  });

  const effectQuery = useQuery({
    queryKey: ['jobs', jobId, 'effect'],
    queryFn: ({ signal }) => jobsApi.getEffect(jobId, signal),
    enabled: jobQuery.data?.status === 'SUCCEEDED',
  });

  const replay = useMutation({
    mutationFn: () => jobsApi.replay(jobId),
    onSuccess: (job) => {
      queryClient.setQueryData(['jobs', job.id], job);
      recentJobsStore.upsert(job);
      pushToast('Dead-lettered job accepted for replay');
    },
  });

  useEffect(() => {
    if (jobQuery.data) {
      recentJobsStore.upsert(jobQuery.data);
    }
  }, [jobQuery.data]);

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    },
    [],
  );

  if (!validId) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Job inspection" title="Invalid job identifier" />
        <InlineError message="The URL does not contain a valid job UUID." />
      </div>
    );
  }

  if (jobQuery.isPending) {
    return (
      <div className="page-stack">
        <LoadingState label="Loading job details" />
      </div>
    );
  }
  if (jobQuery.error || !jobQuery.data) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Job inspection" title="Job unavailable" />
        <RequestError error={jobQuery.error} />
      </div>
    );
  }

  const job = jobQuery.data;

  const copyValue = async (value: string, target: Exclude<CopiedValue, null>): Promise<void> => {
    if (!(await copyText(value))) {
      pushToast('Clipboard access is unavailable. Select and copy the value manually.', 'error');
      return;
    }
    setCopiedValue(target);
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current);
    }
    copiedTimer.current = window.setTimeout(() => setCopiedValue(null), 1_500);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Job inspection"
        title={JOB_TYPE_LABELS[job.type]}
        description={`Submitted ${formatRelativeTime(job.createdAt)} for tenant ${job.tenantId}.`}
        actions={
          <div className="button-row">
            <Link className="button button--secondary" to="/jobs/recent">
              <ArrowLeft size={17} /> Recent jobs
            </Link>
            {job.status === 'DEAD_LETTERED' ? (
              <Button tone="danger" loading={replay.isPending} onClick={() => replay.mutate()}>
                <RefreshCcw size={17} /> Replay job
              </Button>
            ) : null}
          </div>
        }
      />

      {replay.error ? <RequestError error={replay.error} /> : null}

      <div className="job-hero card">
        <div>
          <span className="eyebrow">Current state</span>
          <div className="job-hero__status">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
          <h2>{job.id}</h2>
          <p>{statusExplanation(job)}</p>
        </div>
        <button type="button" className="copy-button" onClick={() => void copyValue(job.id, 'job')}>
          {copiedValue === 'job' ? <Check size={17} /> : <Clipboard size={17} />}
          {copiedValue === 'job' ? 'Copied' : 'Copy job ID'}
        </button>
      </div>

      <div className="content-grid content-grid--details">
        <Card>
          <CardHeader
            title="Processing lifecycle"
            description="Polling adapts to the active lifecycle state and stops at terminal status."
          />
          <div className="timeline">
            {lifecycle.map((step, index) => {
              const state = timelineState(job, step);
              return (
                <div className={`timeline__item timeline__item--${state}`} key={step}>
                  <div className="timeline__marker">{index + 1}</div>
                  <div>
                    <strong>{step.replace('_', ' ')}</strong>
                    <small>{timelineCopy(step)}</small>
                  </div>
                </div>
              );
            })}
            {job.status === 'DEAD_LETTERED' ? (
              <div className="timeline__item timeline__item--failed">
                <div className="timeline__marker">!</div>
                <div>
                  <strong>DEAD LETTERED</strong>
                  <small>Retry budget exhausted or permanent failure.</small>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Execution details"
            description="Durable values returned by the backend. Sensitive identifiers are masked by default."
          />
          <dl className="detail-list">
            <Detail label="Tenant" value={job.tenantId} />
            <div>
              <dt>Idempotency key</dt>
              <dd className="protected-value">
                <code>{keyRevealed ? job.idempotencyKey : maskValue(job.idempotencyKey)}</code>
                <span className="protected-value__actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setKeyRevealed((current) => !current)}
                    aria-label={`${keyRevealed ? 'Hide' : 'Reveal'} idempotency key`}
                  >
                    {keyRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                    {keyRevealed ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => void copyValue(job.idempotencyKey, 'key')}
                  >
                    {copiedValue === 'key' ? <Check size={15} /> : <Clipboard size={15} />}
                    {copiedValue === 'key' ? 'Copied' : 'Copy'}
                  </button>
                </span>
              </dd>
            </div>
            <Detail label="Attempts" value={`${job.attempt} of ${job.maxAttempts}`} />
            <Detail label="Created" value={formatDateTime(job.createdAt)} />
            <Detail label="Updated" value={formatDateTime(job.updatedAt)} />
            <Detail label="Completed" value={formatDateTime(job.completedAt)} />
          </dl>
        </Card>
      </div>

      {job.lastError ? (
        <Card className="card--danger">
          <CardHeader
            title="Last processing error"
            description="The backend records the latest retry or terminal reason."
          />
          <code className="error-code">{job.lastError}</code>
        </Card>
      ) : null}

      {job.status === 'SUCCEEDED' ? (
        <Card>
          <CardHeader
            title="Committed business effect"
            description="This is the canonical side effect protected by the database uniqueness barrier."
          />
          {effectQuery.isPending ? <LoadingState label="Loading committed effect" /> : null}
          {effectQuery.error ? <RequestError error={effectQuery.error} /> : null}
          {effectQuery.data ? (
            <div className="effect-grid">
              <div className="effect-summary">
                <div className="feature-icon">
                  <DatabaseZap size={21} />
                </div>
                <dl className="detail-list">
                  <Detail label="Effect type" value={effectQuery.data.effectType} />
                  <Detail label="Business key" value={effectQuery.data.businessKey} mono />
                  <Detail
                    label="External reference"
                    value={effectQuery.data.externalReference}
                    mono
                  />
                  <Detail label="Committed" value={formatDateTime(effectQuery.data.createdAt)} />
                </dl>
              </div>
              <details className="json-disclosure">
                <summary>View effect details JSON</summary>
                <pre className="json-view" aria-label="Effect details JSON">
                  {JSON.stringify(effectQuery.data.details, null, 2)}
                </pre>
              </details>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="trust-strip">
        <span>
          <ShieldCheck size={18} /> Idempotent side effect
        </span>
        <span>
          <Route size={18} /> At-least-once delivery
        </span>
        <span>
          <Clock3 size={18} /> Safe retry topics
        </span>
      </div>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? 'mono' : undefined}>{value}</dd>
    </div>
  );
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return '••••••••';
  }
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

function pollingInterval(job: JobResponse | undefined): number | false {
  switch (job?.status) {
    case 'PENDING':
      return 5_000;
    case 'QUEUED':
      return 3_000;
    case 'PROCESSING':
      return 2_000;
    case 'RETRYING':
      return 5_000;
    default:
      return false;
  }
}

function statusExplanation(job: JobResponse): string {
  switch (job.status) {
    case 'PENDING':
      return 'The job and outbox event were committed and await publication.';
    case 'QUEUED':
      return 'Kafka accepted the message and a worker can claim it.';
    case 'PROCESSING':
      return 'A worker instance is executing this job.';
    case 'RETRYING':
      return 'A transient failure occurred; the job is moving through a backoff topic.';
    case 'SUCCEEDED':
      return 'The unique business effect and terminal status were committed atomically.';
    case 'DEAD_LETTERED':
      return 'The retry budget was exhausted or a permanent failure occurred.';
  }
}

function timelineCopy(step: (typeof lifecycle)[number]): string {
  switch (step) {
    case 'PENDING':
      return 'PostgreSQL job and outbox transaction committed.';
    case 'QUEUED':
      return 'Published to the selected Kafka priority lane.';
    case 'PROCESSING':
      return 'A multi-instance worker claimed the delivery.';
    case 'SUCCEEDED':
      return 'Business effect committed exactly once.';
  }
}

function timelineState(
  job: JobResponse,
  step: (typeof lifecycle)[number],
): 'complete' | 'current' | 'upcoming' {
  if (job.status === 'DEAD_LETTERED') {
    return step === 'PENDING' ? 'complete' : 'upcoming';
  }
  const jobIndex = lifecycle.indexOf(job.status === 'RETRYING' ? 'PROCESSING' : job.status);
  const stepIndex = lifecycle.indexOf(step);
  return stepIndex < jobIndex ? 'complete' : stepIndex === jobIndex ? 'current' : 'upcoming';
}
