import { useMutation } from '@tanstack/react-query';
import { History, RefreshCw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { jobsApi } from '../../api/jobsApi';
import type { JobResponse } from '../../api/schemas';
import { useToast } from '../../components/feedback/useToast';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useRecentJobs } from '../../hooks/useRecentJobs';
import { mapSettledWithConcurrency } from '../../lib/async';
import { JOB_TYPE_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/format';
import { recentJobsStore } from '../../lib/recentJobsStore';

const REFRESH_CONCURRENCY = 4;

interface RefreshSummary {
  failed: number;
  updated: JobResponse[];
}

export function RecentJobsPage() {
  const jobs = useRecentJobs();
  const { pushToast } = useToast();
  const refresh = useMutation({
    mutationFn: async (): Promise<RefreshSummary> => {
      const results = await mapSettledWithConcurrency(jobs, REFRESH_CONCURRENCY, (job) =>
        jobsApi.get(job.id),
      );
      const updated = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      );
      return { updated, failed: results.length - updated.length };
    },
    onSuccess: ({ updated, failed }) => {
      updated.forEach((job) => recentJobsStore.upsert(job));
      if (failed > 0) {
        pushToast(`${failed} job${failed === 1 ? '' : 's'} could not be refreshed`, 'error');
      } else {
        pushToast('Recent jobs refreshed');
      }
    },
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Local operations history"
        title="Recent jobs"
        description="Non-sensitive job metadata saved in this browser for convenient follow-up."
        actions={
          jobs.length > 0 ? (
            <div className="button-row">
              <Button tone="secondary" loading={refresh.isPending} onClick={() => refresh.mutate()}>
                <RefreshCw size={17} /> Refresh all
              </Button>
              <Button tone="ghost" onClick={() => recentJobsStore.clear()}>
                <Trash2 size={17} /> Clear local history
              </Button>
            </div>
          ) : undefined
        }
      />
      <Card>
        <CardHeader
          title="Tracked jobs"
          description="Clearing this list does not delete any server-side job or effect."
        />
        {jobs.length === 0 ? (
          <EmptyState
            icon={<History size={24} />}
            title="No tracked jobs"
            description="Jobs appear here after submission, lookup, or direct inspection."
            action={
              <Link className="button button--secondary" to="/jobs/search">
                Find a job
              </Link>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Tenant</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Updated</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`}>
                        <strong>{JOB_TYPE_LABELS[job.type]}</strong>
                        <small className="mono">{job.id}</small>
                      </Link>
                    </td>
                    <td>{job.tenantId}</td>
                    <td>
                      <PriorityBadge priority={job.priority} />
                    </td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td>
                      {job.attempt} / {job.maxAttempts}
                    </td>
                    <td>{formatDateTime(job.updatedAt)}</td>
                    <td>
                      <Link className="text-link" to={`/jobs/${job.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
