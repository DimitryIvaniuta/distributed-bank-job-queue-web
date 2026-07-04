import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { jobsApi } from '../../api/jobsApi';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useRecentJobs } from '../../hooks/useRecentJobs';
import { JOB_TYPE_LABELS } from '../../lib/constants';
import { formatRelativeTime } from '../../lib/format';

export function DashboardPage() {
  const recentJobs = useRecentJobs();
  const health = useQuery({
    queryKey: ['system', 'health'],
    queryFn: ({ signal }) => jobsApi.health(signal),
    refetchInterval: 30_000,
    retry: 1,
  });

  const succeeded = recentJobs.filter((job) => job.status === 'SUCCEEDED').length;
  const active = recentJobs.filter((job) =>
    ['PENDING', 'QUEUED', 'PROCESSING', 'RETRYING'].includes(job.status),
  ).length;
  const deadLettered = recentJobs.filter((job) => job.status === 'DEAD_LETTERED').length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Banking operations"
        title="Distributed job queue"
        description="Submit, track, and safely replay banking background jobs across isolated Kafka priority lanes."
        actions={
          <Link to="/jobs/transfer" className="button button--primary">
            New settlement <ArrowRight size={18} />
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Recent job metrics">
        <MetricCard
          label="Recently tracked"
          value={recentJobs.length}
          helper="Stored in this browser"
          icon={<Layers3 />}
        />
        <MetricCard
          label="Active"
          value={active}
          helper="Pending through retrying"
          icon={<Clock3 />}
          tone="blue"
        />
        <MetricCard
          label="Succeeded"
          value={succeeded}
          helper="Committed effects"
          icon={<CheckCircle2 />}
          tone="green"
        />
        <MetricCard
          label="Dead-lettered"
          value={deadLettered}
          helper="Operator review required"
          icon={<TriangleAlert />}
          tone="red"
        />
      </section>

      <div className="content-grid content-grid--dashboard">
        <Card>
          <CardHeader
            title="Recent job activity"
            description="Jobs submitted or opened from this browser."
            action={
              <Link className="text-link" to="/jobs/recent">
                View all <ArrowRight size={15} />
              </Link>
            }
          />
          {recentJobs.length === 0 ? (
            <EmptyState
              icon={<Activity size={24} />}
              title="No recent jobs"
              description="Submit a settlement, reconciliation, or statement job to start tracking activity."
              action={
                <Link to="/jobs/transfer" className="button button--secondary">
                  Submit first job
                </Link>
              }
            />
          ) : (
            <div className="recent-list">
              {recentJobs.slice(0, 5).map((job) => (
                <Link to={`/jobs/${job.id}`} className="recent-row" key={job.id}>
                  <div className="recent-row__icon">{jobIcon(job.type)}</div>
                  <div className="recent-row__main">
                    <strong>{JOB_TYPE_LABELS[job.type]}</strong>
                    <span>
                      {job.tenantId} · {formatRelativeTime(job.updatedAt)}
                    </span>
                  </div>
                  <PriorityBadge priority={job.priority} />
                  <StatusBadge status={job.status} />
                  <ArrowRight size={17} className="recent-row__arrow" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="system-card">
          <CardHeader title="Platform connection" description="Live backend actuator health." />
          <div
            className={`system-health ${health.data?.status === 'UP' ? 'system-health--up' : 'system-health--down'}`}
          >
            <span className="system-health__pulse" />
            <div>
              <strong>
                {health.isPending
                  ? 'Checking service'
                  : health.data?.status === 'UP'
                    ? 'Service operational'
                    : 'Service unavailable'}
              </strong>
              <small>
                {health.data?.status === 'UP'
                  ? 'API is accepting requests'
                  : 'Verify backend and proxy configuration'}
              </small>
            </div>
          </div>
          <div className="queue-lanes">
            <div>
              <span className="lane-dot lane-dot--high" />
              <strong>jobs-high</strong>
              <small>Urgent settlements</small>
            </div>
            <div>
              <span className="lane-dot lane-dot--low" />
              <strong>jobs-low</strong>
              <small>Reports and controls</small>
            </div>
          </div>
          <Link className="button button--secondary button--full" to="/system">
            Open system status
          </Link>
        </Card>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Quick actions</span>
            <h2>Submit banking work</h2>
          </div>
        </div>
        <div className="action-grid">
          <ActionCard
            to="/jobs/transfer"
            icon={<ArrowLeftRight />}
            title="Transfer settlement"
            description="Urgent payment-side effect with retry controls."
            badge="HIGH default"
          />
          <ActionCard
            to="/jobs/reconciliation"
            icon={<Scale />}
            title="Account reconciliation"
            description="Daily account balance verification."
            badge="LOW default"
          />
          <ActionCard
            to="/jobs/statement"
            icon={<FileText />}
            title="Statement generation"
            description="Monthly customer document artifact."
            badge="LOW default"
          />
        </div>
      </section>

      <Card className="architecture-card">
        <div>
          <span className="eyebrow">Correctness model</span>
          <h2>At-least-once delivery without duplicate side effects</h2>
          <p>
            Every request passes through a transactional outbox, isolated Kafka lane, retry topics,
            and a PostgreSQL uniqueness boundary.
          </p>
        </div>
        <div className="architecture-flow" aria-label="Queue processing architecture">
          {[
            'WebFlux API',
            'PostgreSQL outbox',
            'Kafka priority lane',
            'Multi-instance worker',
            'Unique effect',
          ].map((step, index) => (
            <div className="architecture-flow__step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
              {index < 4 ? <ArrowRight size={16} /> : <ShieldCheck size={18} />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'navy',
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function ActionCard({
  to,
  icon,
  title,
  description,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Link to={to} className="action-card">
      <div className="action-card__icon">{icon}</div>
      <span className="action-card__badge">{badge}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="text-link">
        Open form <ArrowRight size={15} />
      </span>
    </Link>
  );
}

function jobIcon(type: keyof typeof JOB_TYPE_LABELS) {
  switch (type) {
    case 'TRANSFER_SETTLEMENT':
      return <ArrowLeftRight size={18} />;
    case 'ACCOUNT_RECONCILIATION':
      return <Scale size={18} />;
    case 'STATEMENT_GENERATION':
      return <FileText size={18} />;
  }
}
