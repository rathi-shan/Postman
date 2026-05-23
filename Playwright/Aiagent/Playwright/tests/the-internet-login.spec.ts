import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const invalidScenarios = [
  {
    title: 'Invalid Username',
    username: 'invalid_username',
    password: 'SuperSecretPassword',
    expectedLocator: 'invalidUsername'
  },
  {
    title: 'Invalid Password',
    username: 'tomsmith',
    password: 'invalid_password',
    expectedLocator: 'invalidPassword'
  },
  {
    title: 'Invalid Credentials',
    username: 'baduser',
    password: 'badpass',
    expectedLocator: 'invalidUsername'
  }
];

test('Valid Credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('tomsmith', 'SuperSecretPassword!');

  await expect(loginPage.successMessage).toBeVisible();
  await expect(page).toHaveURL('https://the-internet.herokuapp.com/secure');
});

test.describe.parallel('Invalid credentials scenarios', () => {
  for (const scenario of invalidScenarios) {
    test(scenario.title, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(scenario.username, scenario.password);

      const locator = scenario.expectedLocator === 'invalidPassword'
        ? loginPage.invalidPasswordMessage
        : loginPage.invalidUsernameMessage;

      await expect(locator).toBeVisible();
    });
  }
});