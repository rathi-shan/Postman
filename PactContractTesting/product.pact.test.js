const { PactV3 } = require('@pact-foundation/pact');
const path = require('path');

// 1. Initialize the Pact provider
const provider = new PactV3({
  consumer: 'ProductWebClient',
  provider: 'ProductService',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Product API', () => {
  it('returns a product when a valid ID is provided', async () => {
    // 2. Arrange: Tell Pact what to expect
    provider.addInteraction({
      states: [{ description: 'product with ID 10 exists' }],
      uponReceiving: 'a request for product 10',
      withRequest: {
        method: 'GET',
        path: '/products/10',
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: '10',
          name: 'Screwdriver',
          price: 15.50,
        },
      },
    });

    // 3. Act: Run your actual code against the Mock Provider
    await provider.executeTest(async (mockServer) => {
      // In a real app, this would be your API client/Axios instance
      const response = await fetch(`${mockServer.url}/products/10`);
      const data = await response.json();

      // 4. Assert: Ensure your code can handle the response
      expect(data.name).toBe('Screwdriver');
      expect(data.price).toBe(15.50);
    });
  });
});