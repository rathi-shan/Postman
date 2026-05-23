import { test, expect } from '@playwright/test';

test.describe('Apply PREMIUM15 Discount Coupon at Checkout', () => {

  // Background steps helper
  async function ensureAppRunning(page: any) {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/|.*home.*/);
  }

  // =====================
  // HAPPY PATH SCENARIOS
  // =====================

  test('Premium user successfully applies PREMIUM15 coupon to an eligible cart', async ({ page }) => {
    await page.goto('/');

    // Given I am logged in as a user with "Premium" account status
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    await page.getByLabel(/email/i).fill('premium.user@example.com');
    await page.getByLabel(/password/i).fill('PremiumPass123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/premium/i)).toBeVisible();

    // And my cart contains the following non-clearance items
    await page.goto('/cart');
    await expect(page.getByText('Running Shoes')).toBeVisible();
    await expect(page.getByText('$80.00')).toBeVisible();
    await expect(page.getByText('Water Bottle')).toBeVisible();
    await expect(page.getByText('$20.00')).toBeVisible();

    // And my cart subtotal is $100.00
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$100.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be accepted
    await expect(page.getByTestId('coupon-success-message')).toBeVisible();

    // And a 15% discount of $15.00 should be applied to my order
    await expect(page.getByTestId('discount-amount')).toHaveText('$15.00');

    // And my new order total should be $85.00
    await expect(page.getByTestId('order-total')).toHaveText('$85.00');
  });

  test('Premium user successfully applies PREMIUM15 coupon to a cart at the minimum threshold', async ({ page }) => {
    await page.goto('/');

    // Given I am logged in as a user with "Premium" account status
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    await page.getByLabel(/email/i).fill('premium.user@example.com');
    await page.getByLabel(/password/i).fill('PremiumPass123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/premium/i)).toBeVisible();

    // And my cart contains the following non-clearance items (Yoga Mat $50.00)
    await page.goto('/cart');
    await expect(page.getByText('Yoga Mat')).toBeVisible();
    await expect(page.getByText('$50.00')).toBeVisible();

    // And my cart subtotal is exactly $50.00
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$50.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be accepted
    await expect(page.getByTestId('coupon-success-message')).toBeVisible();

    // And a 15% discount of $7.50 should be applied to my order
    await expect(page.getByTestId('discount-amount')).toHaveText('$7.50');

    // And my new order total should be $42.50
    await expect(page.getByTestId('order-total')).toHaveText('$42.50');
  });

  test('Premium user applies PREMIUM15 coupon to a mixed cart where only non-clearance items are discounted', async ({ page }) => {
    await page.goto('/');

    // Given I am logged in as a user with "Premium" account status
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    await page.getByLabel(/email/i).fill('premium.user@example.com');
    await page.getByLabel(/password/i).fill('PremiumPass123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/premium/i)).toBeVisible();

    // And my cart contains the following items (Denim Jacket $60.00 Regular, Clearance Shirt $15.00 Clearance)
    await page.goto('/cart');
    await expect(page.getByText('Denim Jacket')).toBeVisible();
    await expect(page.getByText('$60.00')).toBeVisible();
    await expect(page.getByText('Clearance Shirt')).toBeVisible();
    await expect(page.getByText('$15.00')).toBeVisible();

    // And my cart subtotal is $75.00
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$75.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be accepted
    await expect(page.getByTestId('coupon-success-message')).toBeVisible();

    // And the 15% discount should be applied only to the "Denim Jacket" for a discount of $9.00
    await expect(page.getByTestId('discount-amount')).toHaveText('$9.00');
    await expect(page.getByTestId('denim-jacket-discount')).toHaveText('$9.00');

    // And the "Clearance Shirt" price should remain unchanged at $15.00
    await expect(page.getByTestId('clearance-shirt-price')).toHaveText('$15.00');

    // And my new order total should be $66.00
    await expect(page.getByTestId('order-total')).toHaveText('$66.00');
  });

  // ==============================
  // SAD PATH / EDGE CASE SCENARIOS
  // ==============================

  test('Guest user is denied the PREMIUM15 coupon when not logged in', async ({ page }) => {
    await page.goto('/');

    // Given I am not logged in to the application
    // Ensure no active session by navigating directly without login
    await expect(page.getByRole('link', { name: /sign in|log in/i })).toBeVisible();

    // And I have non-clearance items in my cart totaling $100.00
    await page.goto('/cart');
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$100.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be rejected
    await expect(page.getByTestId('coupon-error-message')).toBeVisible();

    // And I should see the error message "Please log in to apply this coupon code."
    await expect(page.getByTestId('coupon-error-message')).toHaveText('Please log in to apply this coupon code.');

    // And no discount should be applied to my order
    await expect(page.getByTestId('discount-amount')).not.toBeVisible();
  });

  test('Standard (non-premium) user is denied the PREMIUM15 coupon', async ({ page }) => {
    await page.goto('/');

    // Given I am logged in as a user with "Standard" account status
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    await page.getByLabel(/email/i).fill('standard.user@example.com');
    await page.getByLabel(/password/i).fill('StandardPass123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/standard/i)).toBeVisible();

    // And my cart contains non-clearance items totaling $100.00
    await page.goto('/cart');
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$100.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be rejected
    await expect(page.getByTestId('coupon-error-message')).toBeVisible();

    // And I should see the error message "This coupon is only available to Premium account holders."
    await expect(page.getByTestId('coupon-error-message')).toHaveText('This coupon is only available to Premium account holders.');

    // And no discount should be applied to my order
    await expect(page.getByTestId('discount-amount')).not.toBeVisible();
  });

  test('Premium user is denied the PREMIUM15 coupon when cart value is below the minimum threshold', async ({ page }) => {
    await page.goto('/');

    // Given I am logged in as a user with "Premium" account status
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    await page.getByLabel(/email/i).fill('premium.user@example.com');
    await page.getByLabel(/password/i).fill('PremiumPass123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/premium/i)).toBeVisible();

    // And my cart contains the following non-clearance items (Socks $10.00, Headband $15.00)
    await page.goto('/cart');
    await expect(page.getByText('Socks')).toBeVisible();
    await expect(page.getByText('$10.00')).toBeVisible();
    await expect(page.getByText('Headband')).toBeVisible();
    await expect(page.getByText('$15.00')).toBeVisible();

    // And my cart subtotal is $25.00
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$25.00');

    // When I enter the coupon code "PREMIUM15" at checkout
    await page.goto('/checkout');
    await page.getByPlaceholder(/coupon|promo code/i).fill('PREMIUM15');
    await page.getByRole('button', { name: /apply/i }).click();

    // Then the coupon should be rejected
    await expect(page.getByTestId('coupon-error-message')).toBeVisible();

    // And I should see the error message "A minimum cart value of $50.00 is required to use this coupon."
    await expect(page.getBy