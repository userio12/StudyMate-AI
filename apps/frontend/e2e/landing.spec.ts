import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders the hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has a call-to-action link to sign in', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /get started/i });
    await expect(cta).toBeVisible();
  });
});
