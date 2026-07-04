import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { jobsApi } from '../../api/jobsApi';
import type { CreateJobRequest } from '../../api/types';
import { useToast } from '../../components/feedback/useToast';
import { recentJobsStore } from '../../lib/recentJobsStore';
import { queryClient } from '../../app/queryClient';

export function useJobSubmission() {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  return useMutation({
    mutationFn: ({
      request,
      idempotencyKey,
    }: {
      request: CreateJobRequest;
      idempotencyKey: string;
    }) => jobsApi.submit(request, idempotencyKey),
    onSuccess: (job) => {
      recentJobsStore.upsert(job);
      queryClient.setQueryData(['jobs', job.id], job);
      pushToast(
        job.deduplicated ? 'Existing idempotent job returned' : 'Job accepted by the queue',
      );
      void navigate(`/jobs/${job.id}`);
    },
  });
}
