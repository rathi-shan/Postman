import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  get usernameField() {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get passwordField() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  get invalidUsernameMessage() {
    return this.page.locator('#flash').getByText('Your username is invalid!');
  }

  get invalidPasswordMessage() {
    return this.page.locator('#flash').getByText('Your password is invalid!');
  }

  get successMessage() {
    return this.page.locator('#flash').getByText('You logged into a secure area!');
  }

  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}