import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { mockHealth } from './fixtures';

test('dashboard has no automatically detectable accessibility violations', async ({ page }) => {
  await mockHealth(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Distributed job queue' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
