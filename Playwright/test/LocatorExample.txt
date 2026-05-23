import { test, expect } from '@playwright/test';

test('Governance-Standard Login', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');

  // 1. Find by Label (links text to the input field)
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');

  // 2. Find by Role (interacts with the button as a user would)
  await page.getByRole('button', { name: /login/i }).click();

  // 3. Find by Text (to verify the outcome)
  await expect(page.getByText('You logged into a secure area!')).toBeVisible();
});
