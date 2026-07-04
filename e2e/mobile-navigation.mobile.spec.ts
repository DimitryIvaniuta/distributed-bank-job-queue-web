import { expect, test } from '@playwright/test';

import { mockHealth } from './fixtures';

test('mobile navigation traps focus, closes with Escape, and restores focus', async ({ page }) => {
  await mockHealth(page);
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close navigation' }).last()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});
