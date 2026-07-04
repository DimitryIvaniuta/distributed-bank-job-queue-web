# Security Policy

## Supported version

Security fixes are applied to release `1.1.x` on `main`.

## Reporting a vulnerability

Do not open a public issue. Use GitHub private vulnerability reporting after publication or an agreed private channel. Include impact, affected version/files, minimal reproduction, and suggested mitigation.

Never include real customer/account data, credentials, tokens, idempotency keys, job payloads, or committed effects.

## Deployment assumptions

This frontend is an operations client, not an authentication authority. Production must use an identity-aware gateway or OIDC Backend-for-Frontend and enforce authorization in the backend. Browser checks are defense in depth only.

## Dependency and incident response

Dependencies are exact-pinned, audited in CI, monitored by Dependabot, reviewed on pull requests, analyzed with CodeQL, and represented in a CycloneDX SBOM. Critical advisories should be triaged immediately and patched releases must pass validation, browser acceptance, and image scanning before deployment.
