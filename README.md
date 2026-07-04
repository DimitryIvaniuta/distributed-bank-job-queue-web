# Distributed Bank Job Queue Web

Production-grade React banking operations console for the Kafka-backed distributed job queue. The application provides typed, guarded workflows for submitting priority jobs, tracking lifecycle state, inspecting committed effects, resolving idempotent requests, and replaying dead-lettered work.

Current release: **1.1.0**.

## Repository

**Suggested GitHub name:** `distributed-bank-job-queue-web`

**Description:**

> Production-grade React 19.2 banking operations console for a Kafka-backed distributed job queue, with TypeScript, bounded runtime API validation, idempotent job forms, live status tracking, DLQ replay, accessibility tests, SBOM generation, and hardened nginx delivery.

## Technology

- React and React DOM `19.2.7`
- TypeScript `6.0.3` with strict compiler settings
- Vite `8.1.0`
- React Router `7.18.0`
- TanStack Query `5.101.2`
- React Hook Form `7.80.0` and Zod `4.4.3`
- Vitest `4.1.9`, Testing Library, and Playwright `1.61.1`
- Node.js 24 LTS for CI and image builds
- Unprivileged nginx production runtime

Dependencies are pinned exactly and installed reproducibly through `package-lock.json`.

## Product capabilities

The UI uses a professional banking shell with a persistent header, grouped desktop/mobile sidebar, central operations workspace, offline indicator, and runtime-aware footer.

### Job intake

- High-priority transfer settlement
- Account reconciliation
- Statement generation
- Tenant, priority, retry budget, and idempotency controls
- Cryptographically generated idempotency keys
- Backend-compatible validation and request-size limits
- Deduplicated submission and HTTP `409` conflict feedback

### Operations

- Lookup by job UUID or tenant/idempotency key
- Adaptive live polling for active jobs
- Lifecycle timeline, attempt count, and failure details
- Privacy-masked idempotency values
- Explicitly disclosed committed-effect JSON
- Dead-letter replay
- Backend actuator health
- Concurrency-limited recent-job refresh
- Browser-local history containing non-sensitive metadata only

## Backend contract

| Method | Endpoint                      | Purpose                                  |
| ------ | ----------------------------- | ---------------------------------------- |
| `POST` | `/api/v1/jobs`                | Submit a job with `Idempotency-Key`      |
| `GET`  | `/api/v1/jobs/{jobId}`        | Read job state                           |
| `GET`  | `/api/v1/jobs/by-key`         | Find a job by tenant and idempotency key |
| `GET`  | `/api/v1/jobs/{jobId}/effect` | Inspect the committed business effect    |
| `POST` | `/api/v1/jobs/{jobId}/replay` | Replay a dead-lettered job               |
| `GET`  | `/actuator/health`            | Check backend health                     |

Every JSON response is content-type checked, size bounded, streamed, and validated with Zod before entering application state. Each request receives a client correlation UUID, which is replaced by the returned proxy/backend identifier when available.

## Local development

### Requirements

- Node.js `22.16` or newer; Node.js 24 LTS is recommended
- npm `10.9` or newer
- Backend on `http://localhost:8080`

### Start

```bash
cp .env.example .env.local
npm ci --ignore-scripts
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` and `/actuator` to the backend.

Supported public build-time settings:

```env
VITE_DEV_BACKEND_URL=http://localhost:8080
VITE_API_BASE_URL=
VITE_API_TIMEOUT_MS=10000
VITE_API_MAX_REQUEST_BYTES=307200
VITE_API_MAX_RESPONSE_BYTES=1048576
VITE_ENVIRONMENT_NAME=Local
```

Vite variables are public browser configuration and must never contain secrets. Same-origin proxying is recommended for production.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run e2e
npm run audit
npm run audit:all
npm run --silent sbom > sbom.cdx.json
npm run validate
```

`npm run validate` performs formatting, ESLint, strict TypeScript, coverage tests, and an optimized production build.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:3000`.

The production container runs nginx as a non-root user, uses a read-only root filesystem, drops all Linux capabilities, enables `no-new-privileges`, applies strict security headers, emits/forwards correlation IDs, avoids transparent retry of mutation requests, and exposes `/healthz`.

Override the backend upstream at runtime:

```bash
API_UPSTREAM=http://backend:8080 docker compose up --build
```

## Testing strategy

Unit and component tests cover the API trust boundary, immutable transport headers, cancellation, malformed and oversized responses, job validation, local-history privacy, bounded concurrency, clipboard safety, date handling, and application-shell behavior.

Playwright covers:

- professional shell and navigation;
- successful transfer through committed effect;
- idempotency conflict rendering;
- dead-letter replay;
- automated Axe accessibility checks;
- mobile focus trap and Escape behavior.

See [docs/TESTING.md](docs/TESTING.md).

## Security model

The frontend does not invent authentication that the backend does not expose. A banking deployment should place the UI and API behind an OIDC Backend-for-Frontend or identity-aware gateway and enforce authorization server-side.

Controls include:

- no unsafe HTML injection or dynamic code execution;
- no browser-persisted bearer tokens;
- runtime schemas and bounded transport bodies;
- transport-owned JSON and correlation headers;
- same-origin credentials and no redirects/referrers;
- no automatic mutation retries;
- masked sensitive operational values;
- strict CSP and reverse-proxy limits;
- exact dependency versions, dual npm audits, Dependabot, dependency review, CodeQL, and CycloneDX SBOM;
- non-root, read-only container delivery.

See [SECURITY.md](SECURITY.md) and [docs/SECURITY-ARCHITECTURE.md](docs/SECURITY-ARCHITECTURE.md).

## CI

GitHub Actions provides:

1. formatting, linting, type checking, dual audits, coverage, production build, and SBOM generation;
2. desktop and mobile Playwright projects using the matching managed Chromium;
3. hardened container construction;
4. pull-request dependency review;
5. scheduled and change-triggered CodeQL analysis.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security architecture](docs/SECURITY-ARCHITECTURE.md)
- [Testing](docs/TESTING.md)
- [Operations](docs/OPERATIONS.md)
- [Verification](docs/VERIFICATION.md)
- [Production audit](docs/PRODUCTION-AUDIT.md)
- [Technology research](docs/RESEARCH.md)
- [Changelog](CHANGELOG.md)

## License

MIT. See [LICENSE](LICENSE).
