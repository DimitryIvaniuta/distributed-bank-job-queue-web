# Operations Guide

## Runtime configuration

The immutable frontend image expects `API_UPSTREAM`, defaulting in Compose to `http://host.docker.internal:8080`. Public `VITE_*` values are compile-time browser configuration and must not contain secrets.

## Health and monitoring

- Frontend liveness: `GET /healthz`
- Backend health through the same origin: `GET /actuator/health`

Monitor these independently. Track proxy `4xx/5xx`, latency, rejected oversized bodies, and backend availability. Correlate browser support references with `X-Correlation-Id` in edge/backend logs. Do not log request bodies or idempotency lookup query values.

## Caching

- `/assets/*`: one year, immutable.
- `/index.html`: no-store.
- SPA routes: no-cache with fallback to `index.html`.

## Release procedure

1. `npm ci --ignore-scripts`.
2. Run both audits and `npm run validate`.
3. Generate and validate `sbom.cdx.json`.
4. Run desktop/mobile Playwright with managed Chromium.
5. Build and scan the image; sign image/SBOM in the target platform.
6. Deploy behind TLS and an identity-aware gateway.
7. Verify liveness, backend health, a read-only lookup, and one controlled submission.
8. Observe proxy failures, client incident references, and queue metrics.

## Rollback

The application is stateless. Redirect traffic to the previous immutable image. Because `index.html` is not cached, a browser refresh immediately resolves the previous hashed asset graph.
