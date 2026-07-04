# Security Architecture

## Threat model

Primary threats are hostile or malformed API responses, cross-site scripting, accidental secret persistence, replayed mutations, oversized bodies, path confusion, correlation spoofing, dependency compromise, clickjacking, and excessive backend exposure.

## Browser controls

### Rendering and XSS

- No `dangerouslySetInnerHTML`, `eval`, dynamic script generation, or `document.write`.
- React escaping is retained for backend values.
- Committed effect JSON is text-only and collapsed until explicitly opened.
- CSP prohibits inline scripts, framing, objects, media, and workers.

### API trust boundary

- Only relative, non-protocol-relative application paths are accepted.
- Requests and streamed responses have configurable byte ceilings.
- JSON media type is required before parsing.
- Every response is validated with Zod.
- Redirects and referrer transmission are disabled.
- Correlation and JSON content headers are transport-owned and cannot be overridden by callers.
- Caller cancellation is preserved; timeouts become stable operator errors.

### Sensitive data

- No bearer tokens in local or session storage.
- Recent history excludes payloads, effects, errors, credentials, and idempotency keys.
- Idempotency keys are masked on detail pages until deliberately revealed.
- Error UI displays a support reference without dumping internal stacks.

### Mutations

- Client mutation retries are disabled.
- nginx transparent upstream retry is disabled.
- Replay remains an explicit operator action.
- Production should add backend authorization, step-up authentication, dual control, and immutable audit trails.

## Supply chain and delivery

- Exact package versions and reproducible lockfile.
- Production and full dependency audits.
- Dependabot and pull-request dependency review.
- CodeQL for JavaScript/TypeScript.
- CycloneDX SBOM generated in CI.
- Multi-stage image with unprivileged nginx.
- Read-only root filesystem, dropped capabilities, and `no-new-privileges` in Compose.
- Security headers include CSP, COOP, CORP, Referrer Policy, Permissions Policy, frame denial, and MIME-sniffing protection.

## Authentication boundary

The reference backend has no authentication contract. Cosmetic frontend-only access control would be unsafe. Production must terminate identity through an OIDC-capable gateway or Backend-for-Frontend and enforce roles and entitlements in the backend.

Suggested roles include operations viewer, payment operator, reconciliation operator, replay approver, and platform administrator.

## Residual risks

A malicious browser extension can read page content, a compromised backend may send schema-valid misinformation, and client validation cannot replace backend correctness. Managed devices, TLS/HSTS, WAF/rate limiting, backend authorization, audit logging, and privacy-reviewed telemetry remain deployment responsibilities.
