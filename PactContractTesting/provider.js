const express = require('express');
const app = express();
const port = 8080;

// This is the real API the Provider team wrote
app.get('/products/:id', (req, res) => {
  res.json({
    id: req.params.id,
    product_name: 'Screwdriver', // Try changing this to 'Drill' later to see the test fail!
    price: 15.50
  });
});

const server = app.listen(port, () => {
  console.log(`Provider service listening on http://localhost:${port}`);
});

module.exports = server;