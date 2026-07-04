# Frontend Architecture

## Overview

The application is a client-rendered operations console with strict separation between remote data, transient form state, local convenience state, and visual composition.

```text
Browser
  ├── React shell: header / navigation / workspace / footer
  ├── Lazy workflow routes and accessible route announcements
  ├── TanStack Query remote-state cache
  ├── React Hook Form transient state
  ├── Zod runtime schemas
  └── Sanitized recent-job preferences
           │ same-origin HTTP + correlation id
           ▼
Unprivileged nginx
  ├── Static content and SPA fallback
  ├── Request/response limits and security headers
  ├── /api/* proxy
  └── /actuator/* proxy
           │
           ▼
Spring WebFlux job-queue backend
```

## Module boundaries

- `src/api`: bounded transport, runtime schemas, and backend adapters.
- `src/app`: composition root, query client, lazy router, and global error boundary.
- `src/components`: layout, system state, feedback, and reusable UI.
- `src/config`: validated public runtime/build configuration.
- `src/features`: vertical banking workflows.
- `src/hooks`: online state, theme, and local-history integration.
- `src/lib`: framework-light formatting, concurrency, clipboard, and storage utilities.
- `src/styles`: tokens and responsive banking layout.

Feature components never call `fetch` directly. The centralized client owns path validation, timeouts, cancellation, correlation, credentials, content type, body ceilings, JSON parsing, and Zod validation.

## State ownership

### Server state

TanStack Query owns jobs, effects, and health. Query retries are conservative, `4xx` failures are not retried, reconnect behavior is explicit, and active-job polling slows as the job progresses before stopping at terminal state.

### Form state

React Hook Form owns transient inputs. Zod supplies fast feedback while PostgreSQL-backed backend validation remains authoritative. Calendar defaults are generated in local time to avoid UTC day/month drift.

### Browser state

Recent history stores only non-sensitive metadata. Theme state is guarded against unavailable/malformed storage and synchronizes across tabs. No payload, effect body, error details, credential, token, or idempotency key is persisted.

## Delivery and rendering

Workflow pages are loaded with `React.lazy`, keeping initial rendering focused on the shell. Suspense supplies an accessible loading state. Each route updates the document title, announces navigation through a live region, and moves focus to the main workspace.

The production image is environment-neutral: nginx resolves `API_UPSTREAM` at container start and proxies same-origin API calls. Hashed assets are immutable; the HTML entry point is not cached.

## Failure model

- Network/offline state is visible and reconnect triggers query recovery.
- API failures expose a correlation reference but not raw sensitive payloads.
- Oversized requests fail before `fetch`; oversized responses are cancelled while streaming.
- Mutation requests are not automatically retried by the browser client or nginx.
- The global error boundary produces a local incident ID and emits a sanitized custom event suitable for an organization-approved telemetry adapter.
