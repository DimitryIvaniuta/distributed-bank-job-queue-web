import { expect, test } from '@playwright/test';

import { mockHealth } from './fixtures';

test('renders the professional banking shell and core navigation', async ({ page }) => {
  await mockHealth(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Distributed job queue' })).toBeVisible();
  await expect(page.getByText('Service operational')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Transfer settlement' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toContainText('At-least-once delivery');
});
