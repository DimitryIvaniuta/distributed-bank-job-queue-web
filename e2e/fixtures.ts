import type { Page, Route } from '@playwright/test';

export const jobId = '550e8400-e29b-41d4-a716-446655440000';

export function jobResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: jobId,
    tenantId: 'retail-bank',
    idempotencyKey: 'e2e-key-12345678',
    type: 'TRANSFER_SETTLEMENT',
    priority: 'HIGH',
    status: 'PENDING',
    attempt: 0,
    maxAttempts: 5,
    lastError: null,
    createdAt: '2026-06-28T12:00:00Z',
    updatedAt: '2026-06-28T12:00:00Z',
    completedAt: null,
    deduplicated: false,
    ...overrides,
  };
}

export async function json(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
    headers: { 'X-Correlation-Id': 'e2e-correlation-id' },
  });
}

export async function mockHealth(page: Page): Promise<void> {
  await page.route('**/actuator/health', (route) => json(route, { status: 'UP' }));
}
