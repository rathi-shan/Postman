const { Verifier } = require('@pact-foundation/pact');
const path = require('path');
const server = require('./provider'); // Imports your Express server

describe('Pact Verification', () => {
  it('validates the expectations of ProductWebClient', async () => {
const opts = {
  providerBaseUrl: 'http://localhost:8080',
  provider: 'ProductService',
  
  pactBrokerUrl: 'https://xyz-76ad5fa4.pactflow.io',
  pactBrokerToken: '480baed1-5508-4fcd-b484-feea763ca302',
  
  // Try this simplified selector first
  consumerVersionSelectors: [
    {
      latest: true 
    }
  ],

  publishVerificationResult: true, 
  providerVersion: '1.0.0', 

  stateHandlers: {
    'product with ID 10 exists': () => {
      return Promise.resolve('Data setup complete');
    },
  },
};
    try {
      await new Verifier(opts).verifyProvider();
      console.log('Pact Verification Passed!');
    } finally {
      server.close(); // Stop the server after tests
    }
  }, 30000); // Increase timeout for slower machines
});