import { expect, test } from '@playwright/test';

import { jobId, jobResponse, json } from './fixtures';

test('submits a transfer and follows it through success to the committed effect', async ({
  page,
}) => {
  let submittedBody: unknown;
  let submittedKey: string | undefined;

  await page.route('**/api/v1/jobs', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    submittedBody = route.request().postDataJSON() as unknown;
    submittedKey = route.request().headers()['idempotency-key'];
    await json(route, jobResponse(), 202);
  });

  await page.route(`**/api/v1/jobs/${jobId}`, (route) =>
    json(
      route,
      jobResponse({
        status: 'SUCCEEDED',
        attempt: 1,
        updatedAt: '2026-06-28T12:00:04Z',
        completedAt: '2026-06-28T12:00:04Z',
      }),
    ),
  );

  await page.route(`**/api/v1/jobs/${jobId}/effect`, (route) =>
    json(route, {
      id: '5f2e8400-e29b-41d4-a716-446655440001',
      jobId,
      effectType: 'TRANSFER_SETTLEMENT',
      businessKey: 'TRF-E2E-100',
      externalReference: 'SET-TRF-E2E-100',
      details: { amount: 1250, currency: 'EUR' },
      createdAt: '2026-06-28T12:00:04Z',
    }),
  );

  await page.goto('/jobs/transfer');
  await page.getByLabel('Transfer ID').fill('TRF-E2E-100');
  await page.getByLabel('Amount').fill('1250.00');
  await page.getByRole('button', { name: /Submit settlement/ }).click();

  await expect(page).toHaveURL(new RegExp(`/jobs/${jobId}$`));
  await expect(page.getByText('Succeeded', { exact: true })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText('SET-TRF-E2E-100')).toBeVisible();
  expect(submittedKey).toBeTruthy();
  expect(submittedBody).toMatchObject({
    tenantId: 'retail-bank',
    type: 'TRANSFER_SETTLEMENT',
    priority: 'HIGH',
    payload: { transferId: 'TRF-E2E-100', amount: 1250, currency: 'EUR' },
  });
});

test('shows a stable idempotency conflict without navigating away', async ({ page }) => {
  await page.route('**/api/v1/jobs', (route) =>
    json(
      route,
      {
        timestamp: '2026-06-28T12:00:00Z',
        status: 409,
        error: 'Idempotency key is already used by a different request',
        details: [],
        path: '/api/v1/jobs',
      },
      409,
    ),
  );

  await page.goto('/jobs/transfer');
  await page.getByRole('button', { name: /Submit settlement/ }).click();

  await expect(page.getByRole('alert')).toContainText('Idempotency key is already used');
  await expect(page).toHaveURL(/\/jobs\/transfer$/);
});
