import clsx from 'clsx';

import type { JobPriority, JobStatus } from '../../api/schemas';
import { JOB_STATUS_LABELS } from '../../lib/constants';

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={clsx('badge', `badge--${status.toLowerCase()}`)}>
      <span className="badge__dot" aria-hidden="true" />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  return (
    <span className={clsx('priority', `priority--${priority.toLowerCase()}`)}>{priority}</span>
  );
}
