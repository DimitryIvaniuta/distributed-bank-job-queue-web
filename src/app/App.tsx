import { lazy, Suspense, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { LoadingState } from '../components/ui/LoadingState';

function lazyNamed<T extends Record<K, ComponentType>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K,
) {
  return lazy(async () => ({ default: (await loader())[exportName] }));
}

const DashboardPage = lazyNamed(
  () => import('../features/dashboard/DashboardPage'),
  'DashboardPage',
);
const JobDetailPage = lazyNamed(() => import('../features/jobs/JobDetailPage'), 'JobDetailPage');
const JobSearchPage = lazyNamed(() => import('../features/jobs/JobSearchPage'), 'JobSearchPage');
const RecentJobsPage = lazyNamed(() => import('../features/jobs/RecentJobsPage'), 'RecentJobsPage');
const ReconciliationSubmissionPage = lazyNamed(
  () => import('../features/jobs/ReconciliationSubmissionPage'),
  'ReconciliationSubmissionPage',
);
const StatementSubmissionPage = lazyNamed(
  () => import('../features/jobs/StatementSubmissionPage'),
  'StatementSubmissionPage',
);
const TransferSubmissionPage = lazyNamed(
  () => import('../features/jobs/TransferSubmissionPage'),
  'TransferSubmissionPage',
);
const NotFoundPage = lazyNamed(() => import('../features/operations/NotFoundPage'), 'NotFoundPage');
const ReplayPage = lazyNamed(() => import('../features/operations/ReplayPage'), 'ReplayPage');
const SystemStatusPage = lazyNamed(
  () => import('../features/operations/SystemStatusPage'),
  'SystemStatusPage',
);

function RouteFallback() {
  return (
    <div className="page-stack route-loading" role="status">
      <LoadingState label="Loading workspace" />
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="jobs/transfer" element={<TransferSubmissionPage />} />
          <Route path="jobs/reconciliation" element={<ReconciliationSubmissionPage />} />
          <Route path="jobs/statement" element={<StatementSubmissionPage />} />
          <Route path="jobs/recent" element={<RecentJobsPage />} />
          <Route path="jobs/search" element={<JobSearchPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="operations/replay" element={<ReplayPage />} />
          <Route path="system" element={<SystemStatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
