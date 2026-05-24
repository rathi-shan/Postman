```typescript
import { test, expect } from '@playwright/test';

test.describe('Biometric Bi-weekly Authentication Bypass Lockout', () => {

  test('Successful FaceID login on first attempt clears any prior failed attempt counter', async ({ page }) => {
    // Given a registered mobile banking user with FaceID enabled
    await page.goto('/mobile-banking/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // And the user has 1 previously recorded failed FaceID attempt
    // (Precondition assumed set via API/state setup; represented by verifying counter state in UI)
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('1');

    // When the user successfully authenticates via FaceID
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('success');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the user should be granted access to the mobile banking dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // And the consecutive failed FaceID attempt counter should be reset to 0
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('0');

    // And no lockout warning push notification should be dispatched
    await expect(page.getByTestId('push-notification-warning')).not.toBeVisible();
  });

  test('Successful FaceID login on second attempt after one failure grants access and resets counter', async ({ page }) => {
    // Given a registered mobile banking user with FaceID enabled
    await page.goto('/mobile-banking/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // And the user has 1 previously recorded failed FaceID attempt
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('1');

    // When the user successfully authenticates via FaceID on the next attempt
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('success');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the user should be granted full access to the mobile banking application
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // And the consecutive failed FaceID attempt counter should be reset to 0
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('0');

    // And the account status should remain "active" and unlocked
    await expect(page.getByTestId('account-status')).toHaveText('active');
  });

  test('Administrator successfully unlocks a locked account via the secure admin dashboard', async ({ page }) => {
    // Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    await page.goto('/admin/dashboard');

    // And a system administrator is authenticated on the secure admin dashboard
    await page.getByLabel('Admin Username').fill('admin_user');
    await page.getByLabel('Admin Password').fill('admin_secure_password');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();

    // When the administrator locates the locked user profile
    await page.getByPlaceholder('Search user by name or ID').fill('locked_test_user');
    await page.getByRole('button', { name: /search/i }).click();
    await expect(page.getByTestId('user-profile-card')).toBeVisible();
    await expect(page.getByTestId('account-status')).toHaveText('locked');

    // And the administrator applies a manual override unlock action on the profile
    await page.getByRole('button', { name: /manual override unlock/i }).click();
    await page.getByRole('button', { name: /confirm unlock/i }).click();

    // Then the user account status should be updated to "active" and unlocked
    await expect(page.getByTestId('account-status')).toHaveText('active');

    // And the consecutive failed FaceID attempt counter should be reset to 0
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('0');

    // And the lockout timer should be cleared immediately regardless of remaining duration
    await expect(page.getByTestId('lockout-timer')).toHaveText('0:00');

    // And an audit log entry should be recorded capturing the administrator ID, timestamp, and action taken
    await page.getByRole('link', { name: /audit log/i }).click();
    await expect(page.getByTestId('audit-log-entry').first()).toContainText('admin_user');
    await expect(page.getByTestId('audit-log-entry').first()).toContainText('manual override unlock');
    await expect(page.getByTestId('audit-log-timestamp').first()).not.toBeEmpty();
  });

  test('Account lockout expires automatically after exactly 15 minutes and user can authenticate', async ({ page }) => {
    // Given a mobile banking user account was locked due to 3 consecutive failed FaceID attempts
    // And exactly 15 minutes have elapsed since the lockout was imposed
    await page.goto('/mobile-banking/login');
    await expect(page.getByTestId('account-status')).toHaveText('active');

    // When the user attempts FaceID authentication
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('success');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the account should be automatically unlocked
    await expect(page.getByTestId('account-status')).toHaveText('active');

    // And the user should be permitted to attempt FaceID authentication again
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // And the consecutive failed FaceID attempt counter should be reset to 0
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('0');
  });

  test('Warning push notification is dispatched on exactly the 2nd consecutive failed FaceID attempt', async ({ page }) => {
    // Given a registered mobile banking user with FaceID enabled
    await page.goto('/mobile-banking/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // And the user has 1 previously recorded failed FaceID attempt
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('1');

    // And the user has push notifications enabled on their device
    await expect(page.getByTestId('push-notifications-status')).toHaveText('enabled');

    // When the user fails FaceID authentication for the 2nd consecutive time
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('failure');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the user should NOT be locked out of the account
    await expect(page.getByTestId('account-status')).not.toHaveText('locked');

    // And a warning push notification should be dispatched immediately to the user's registered device
    await expect(page.getByTestId('push-notification-warning')).toBeVisible();

    // And the push notification message should warn the user that one more failed attempt will lock the account
    await expect(page.getByTestId('push-notification-warning')).toContainText(/one more failed attempt will lock/i);

    // And the consecutive failed FaceID attempt counter should be incremented to 2
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('2');
  });

  test('Account is locked immediately and precisely on the 3rd consecutive failed FaceID attempt', async ({ page }) => {
    // Given a registered mobile banking user with FaceID enabled
    await page.goto('/mobile-banking/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // And the user has 2 previously recorded consecutive failed FaceID attempts
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('2');

    // When the user fails FaceID authentication for the 3rd consecutive time
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('failure');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the account should be locked immediately
    await expect(page.getByTestId('account-status')).toHaveText('locked');

    // And the user should be denied access to the mobile banking application
    await expect(page.getByRole('heading', { name: /dashboard/i })).not.toBeVisible();
    await expect(page.getByTestId('lockout-message')).toBeVisible();

    // And an account lockout push notification should be dispatched to the user's registered device
    await expect(page.getByTestId('push-notification-lockout')).toBeVisible();

    // And the lockout duration should be set to exactly 15 minutes from the moment of the 3rd failure
    await expect(page.getByTestId('lockout-duration')).toHaveText('15:00');

    // And the consecutive failed FaceID attempt counter should reflect 3 failed attempts
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('3');
  });

  test('Account remains locked if user attempts FaceID authentication before the 15-minute lockout expires', async ({ page }) => {
    // Given a mobile banking user account is currently locked due to 3 consecutive failed FaceID attempts
    // And only 14 minutes and 59 seconds have elapsed since the lockout was imposed
    await page.goto('/mobile-banking/login');
    await expect(page.getByTestId('account-status')).toHaveText('locked');
    await expect(page.getByTestId('lockout-timer')).toBeVisible();

    // When the user attempts FaceID authentication
    await page.getByRole('button', { name: /authenticate with face id/i }).click();

    // Then the authentication attempt should be rejected without processing the biometric scan
    await expect(page.getByTestId('faceid-scan-processed')).not.toBeVisible();

    // And the user should be presented with a lockout message indicating the remaining lockout time
    await expect(page.getByTestId('lockout-message')).toBeVisible();
    await expect(page.getByTestId('lockout-remaining-time')).toBeVisible();

    // And the account should remain in a locked state
    await expect(page.getByTestId('account-status')).toHaveText('locked');

    // And the lockout timer should NOT be reset by this attempt
    const timerText = await page.getByTestId('lockout-timer').textContent();
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await expect(page.getByTestId('lockout-timer')).not.toHaveText('15:00');
    expect(timerText).not.toBe('15:00');
  });

  test('No push notification is dispatched on the 1st consecutive failed FaceID attempt', async ({ page }) => {
    // Given a registered mobile banking user with FaceID enabled
    await page.goto('/mobile-banking/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // And the user has 0 previously recorded failed FaceID attempts
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('0');

    // When the user fails FaceID authentication for the 1st consecutive time
    await page.getByRole('button', { name: /authenticate with face id/i }).click();
    await page.getByTestId('faceid-result').selectOption('failure');
    await page.getByRole('button', { name: /confirm authentication/i }).click();

    // Then the user should NOT be locked out of the account
    await expect(page.getByTestId('account-status')).not.toHaveText('locked');

    // And no push notification should be dispatched
    await expect(page.getByTestId('push-notification-warning')).not.toBeVisible();
    await expect(page.getByTestId('push-notification-lockout')).not.toBeVisible();

    // And the consecutive failed FaceID attempt counter should be incremented to 1
    await expect(page.getByTestId('failed-attempt-counter')).toHaveText('1');
  });

});
```