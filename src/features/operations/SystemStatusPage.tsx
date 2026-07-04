import { useQuery } from '@tanstack/react-query';
import { Activity, Database, RadioTower, RefreshCw, Server, ShieldCheck } from 'lucide-react';

import { jobsApi } from '../../api/jobsApi';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { RequestError } from '../../components/ui/RequestError';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { runtimeConfig } from '../../config/runtimeConfig';

export function SystemStatusPage() {
  const health = useQuery({
    queryKey: ['system', 'health'],
    queryFn: ({ signal }) => jobsApi.health(signal),
    refetchInterval: 30_000,
    retry: 1,
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Platform operations"
        title="System status"
        description="Same-origin connectivity and backend actuator health for this console."
        actions={
          <Button
            tone="secondary"
            loading={health.isFetching}
            onClick={() => void health.refetch()}
          >
            <RefreshCw size={17} /> Refresh
          </Button>
        }
      />
      {health.isPending ? <LoadingState label="Checking backend health" /> : null}
      {health.error ? <RequestError title="Backend is not reachable" error={health.error} /> : null}
      {health.data ? (
        <>
          <Card
            className={
              health.data.status === 'UP'
                ? 'health-banner health-banner--up'
                : 'health-banner health-banner--down'
            }
          >
            <div className="health-banner__icon">
              <Activity />
            </div>
            <div>
              <span className="eyebrow">Actuator health</span>
              <h2>
                {health.data.status === 'UP'
                  ? 'Backend service is operational'
                  : `Backend status: ${health.data.status}`}
              </h2>
              <p>The browser can reach the configured API through the same-origin proxy.</p>
            </div>
          </Card>
          <div className="action-grid">
            <Capability
              icon={<Server />}
              title="Reactive API"
              description="WebFlux submission, lookup, effect, and replay endpoints."
            />
            <Capability
              icon={<RadioTower />}
              title="Priority queue"
              description="Kafka high and low lanes with non-blocking retry topics."
            />
            <Capability
              icon={<Database />}
              title="Correctness store"
              description="PostgreSQL outbox and unique side-effect constraints."
            />
          </div>
          <Card>
            <CardHeader
              title="Frontend safety posture"
              description="Controls applied by the browser client and production web server."
            />
            <ul className="check-list check-list--columns">
              <li>Runtime validation of every API response</li>
              <li>Bounded request and response bodies with cancellation</li>
              <li>No authentication tokens in local storage</li>
              <li>Strict Content Security Policy in nginx</li>
              <li>No unsafe HTML rendering</li>
              <li>Production source maps disabled</li>
              <li>Same-origin API proxy and per-request correlation IDs</li>
              <li>Dependency audit, SBOM, and accessibility checks in CI</li>
            </ul>
            <div className="runtime-summary">
              <span>
                Environment: <strong>{runtimeConfig.environmentName}</strong>
              </span>
              <span>
                Frontend release: <strong>v{runtimeConfig.release}</strong>
              </span>
              <span>
                Response ceiling:{' '}
                <strong>{Math.round(runtimeConfig.maxResponseBytes / 1024)} KiB</strong>
              </span>
            </div>
            <div className="trust-strip">
              <span>
                <ShieldCheck size={18} /> Browser trust boundary enforced
              </span>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Capability({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="action-card action-card--static">
      <div className="action-card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
