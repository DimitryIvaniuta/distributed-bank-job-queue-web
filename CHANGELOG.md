# Changelog

All notable changes are documented in this file.

## 1.1.0 — 2026-06-28

### Added

- Route-level lazy loading with focused navigation announcements and per-route document titles.
- Offline status feedback and reconnect-aware server queries.
- Environment and release metadata in the operator shell and system-status page.
- Request correlation identifiers with operator-visible support references.
- Bounded request and streaming response-size enforcement at the API trust boundary.
- Privacy-safe masking for idempotency keys and collapsed effect payloads.
- Concurrency-limited refresh for locally tracked jobs.
- Cross-tab theme synchronization and resilient preference handling.
- Mobile navigation focus trapping, Escape dismissal, and trigger-focus restoration.
- Automated Axe accessibility checks and a dedicated mobile Playwright project.
- CycloneDX software bill of materials generation and artifact retention.
- CodeQL and pull-request dependency review workflows.
- Current Node 24-based GitHub and Docker action generations.

### Changed

- Upgraded React type definitions to `19.2.17` while retaining the compatible ESLint 9 toolchain.
- Increased unit and contract coverage thresholds.
- Made active-job polling adaptive to lifecycle state.
- Hardened nginx proxy timeouts, request limits, correlation logging, and security headers.
- Prevented callers from overriding transport-controlled JSON and correlation headers.
- Updated the runtime container and OCI metadata for release `1.1.0`.

### Fixed

- Avoided UTC date drift in statement and reconciliation forms by using local calendar values.
- Cached external-store snapshots and guarded malformed browser preferences.
- Prevented duplicate toast floods and cleaned up notification timers.
- Corrected SBOM generation so redirected output is valid CycloneDX JSON.

## 1.0.0 — 2026-06-28

### Added

- Professional responsive banking operations shell with header, sidebar, workspace, and footer.
- Transfer settlement, account reconciliation, and statement generation forms.
- Job lookup by UUID and by tenant/idempotency key.
- Live job polling, lifecycle timeline, retry state, and committed-effect inspection.
- Dead-letter replay and backend health workflows.
- Runtime-validated API client with timeout, cancellation, and stable error handling.
- Privacy-minimized browser recent-job history.
- Light and dark themes with accessibility and reduced-motion support.
- Vitest, Testing Library, and Playwright test suites.
- Hardened unprivileged nginx container and same-origin backend proxy.
- GitHub Actions verification, browser, and container jobs.
- Dependabot, security policy, production audit, and operations documentation.
