# Production Audit

Release: `1.1.0`

## Implemented findings

### Correctness and resilience

- Added validated runtime configuration with conservative bounds.
- Added immutable correlation identifiers and protected transport headers.
- Bounded request serialization and streamed response reads.
- Required JSON content types and Zod-validated all response shapes.
- Preserved explicit cancellation separately from timeout failures.
- Added adaptive polling, reconnect behavior, and offline feedback.
- Limited bulk refresh concurrency.
- Corrected local-calendar defaults to avoid UTC drift.

### Security and privacy

- Masked idempotency keys and collapsed effect bodies by default.
- Kept sensitive fields out of browser persistence.
- Disabled mutation retries at the query and reverse-proxy layers.
- Hardened CSP, frame, MIME, permissions, referrer, request-size, and timeout policies.
- Added CodeQL, dependency review, dual npm audits, Dependabot, and CycloneDX SBOM.
- Retained unprivileged, read-only container execution.

### Performance

- Added lazy route chunks with a small shell-first entry bundle.
- Kept production source maps disabled.
- Preserved immutable caching for content-hashed assets.

### Accessibility and UX

- Added route titles, live announcements, and main-content focus transfer.
- Added mobile focus containment, Escape close, and trigger restoration.
- Added automated Axe and mobile browser tests.
- Added cross-tab theme synchronization and resilient preferences.
- Added environment/release visibility and support references.

## Deployment-specific work still required

- OIDC/BFF authentication and backend RBAC.
- Dual approval for high-risk settlement/replay operations.
- Central audit logging and privacy-reviewed real-user monitoring.
- Managed WAF, rate limiting, TLS/HSTS, and device posture.
- Image/SBOM signing, provenance attestations, and registry scanning.
