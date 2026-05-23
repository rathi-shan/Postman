const { Publisher } = require('@pact-foundation/pact-node');
const path = require('path');

const opts = {
  pactFilesOrDirs: [path.resolve(__dirname, 'pacts')],
  pactBroker: 'https://xyz-76ad5fa4.pactflow.io',
  pactBrokerToken: '0Lat5oSutuZLxP2ZHT3Phw',
  consumerVersion: '1.0.0',
};

// Changed .publishPacts() to .publish()
new Publisher(opts).publish().then(() => {
  console.log('🚀 Pacts published successfully!');
}).catch(e => {
  console.error('❌ Deployment failed: ', e);
});