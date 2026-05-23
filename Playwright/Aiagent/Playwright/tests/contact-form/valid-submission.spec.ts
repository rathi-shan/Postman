// spec: specs/plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Contact Form Tests', () => {
  test('should fill and submit contact form with valid data', async ({ page }) => {
    // 1. Navigate to a demo contact form
    await page.goto('https://demoqa.com/automation-practice-form');

    // 2. Fill in Name field with 'John Doe'
    await page.fill('#firstName', 'John Doe');

    // 3. Fill in Email field with 'john@example.com'
    await page.fill('#userEmail', 'john@example.com');

    // 4. Fill in Subject field with 'Product Inquiry'
    await page.fill('#subjectsInput', 'Product Inquiry');

    // 5. Fill in Message field with 'I would like to know more about your services'
    await page.fill('#currentAddress', 'I would like to know more about your services');

    // 6. Click the Submit button 
    await page.click('#submit');

    // 7. Verify a success message appears
    // Wait for the modal with success message to be visible
    const successModal = page.locator('.modal.show');
    await expect(successModal).toBeVisible({ timeout: 5000 });

    // Verify the modal contains the submitted data
    const modalBody = page.locator('.modal-body');
    await expect(modalBody).toContainText('John Doe');
    await expect(modalBody).toContainText('john@example.com');
  });
});
