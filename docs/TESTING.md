# Testing Strategy

## Test layers

### Unit and contract tests

Vitest verifies deterministic utilities, form schemas, browser storage, request bounds, response streaming, content types, transport-controlled headers, timeout/cancellation, API schemas, and adapters. Coverage thresholds are enforced in CI.

Current release result: **9 test files and 33 tests passed**.

### Component behavior

Testing Library exercises the rendered banking shell, navigation, route metadata, and health state through accessibility-first queries.

### Browser acceptance

Playwright runs two projects:

- desktop Chromium for shell, submission/effect, conflict, replay, and Axe checks;
- mobile Chromium for focus trapping, Escape dismissal, and focus restoration.

Network interception uses deterministic backend contracts, while true backend/database/Kafka integration remains in the backend repository.

## Commands

```bash
npm run test
npm run test:coverage
npm run e2e
npm run e2e:ui
npx playwright test --list
```

Install the matching browser with:

```bash
npx playwright install --with-deps chromium
```

A local system browser can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, but Playwright's managed browser is preferred.

## Accessibility

Static JSX rules run through `eslint-plugin-jsx-a11y`. Browser checks use `@axe-core/playwright`. The mobile sidebar is also tested behaviorally because focus management cannot be established by static analysis alone.
