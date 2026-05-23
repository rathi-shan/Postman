import { test, expect } from '@playwright/test';

test('Click login button and verify URL change', async ({ page }) => {
  // Navigate to GitHub homepage
  await page.goto('https://github.com/');

  // Click the Sign in link
  await page.click('a[href="/login"]');

  // Wait for navigation to complete
  await page.waitForURL(/.*login/);

  // Verify the URL has changed to the login page
  expect(page.url()).toContain('/login');
});
