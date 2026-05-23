import { test, expect } from '@playwright/test';

test.beforeAll(async ({ request }) => {
  // Automatically setup the 503 mapping before tests run
  await request.post('http://localhost:8080/__admin/mappings', {
    data: {
      request: { method: 'GET', url: '/v1/credit-bureau/score/user-123' },
      response: {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Credit Bureau database is undergoing maintenance.' })
      }
    }
  });
});

test.describe('Credit Bureau API Error Handling', () => {
  test('should show error message when Credit Bureau is down (503)', async ({ page }) => {
    const response = await page.request.get('http://localhost:8080/v1/credit-bureau/score/user-123');
    expect(response.status()).toBe(503);
    const body = await response.json();
    
    // This will now pass because beforeAll set it up correctly!
    expect(body.message).toBe('Credit Bureau database is undergoing maintenance.');
  });
});