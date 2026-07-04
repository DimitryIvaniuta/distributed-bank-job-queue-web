import {
  Activity,
  ArrowLeftRight,
  FileSearch,
  FileText,
  Gauge,
  History,
  RefreshCcw,
  Scale,
} from 'lucide-react';

export const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: Gauge, end: true },
      { to: '/jobs/recent', label: 'Recent jobs', icon: History },
    ],
  },
  {
    label: 'Submit jobs',
    items: [
      { to: '/jobs/transfer', label: 'Transfer settlement', icon: ArrowLeftRight },
      { to: '/jobs/reconciliation', label: 'Reconciliation', icon: Scale },
      { to: '/jobs/statement', label: 'Statements', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/jobs/search', label: 'Find a job', icon: FileSearch },
      { to: '/operations/replay', label: 'Replay dead letter', icon: RefreshCcw },
      { to: '/system', label: 'System status', icon: Activity },
    ],
  },
] as const;
