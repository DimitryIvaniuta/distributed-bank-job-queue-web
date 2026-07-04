import { expect, test } from '@playwright/test';

import { jobId, jobResponse, json } from './fixtures';

test('replays a dead-lettered job and returns it to pending', async ({ page }) => {
  await page.route(`**/api/v1/jobs/${jobId}`, (route) =>
    json(
      route,
      jobResponse({
        status: 'DEAD_LETTERED',
        attempt: 5,
        lastError: 'Settlement provider rejected the transfer',
      }),
    ),
  );
  await page.route(`**/api/v1/jobs/${jobId}/replay`, (route) =>
    json(route, jobResponse({ status: 'PENDING', attempt: 0 }), 202),
  );

  await page.goto(`/jobs/${jobId}`);
  await expect(page.getByText('Dead-lettered', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay job' }).click();

  await expect(page.getByText('Pending', { exact: true })).toBeVisible();
  await expect(page.getByText('Dead-lettered job accepted for replay')).toBeVisible();
});
