const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.get('/products', async (req, res) => {
  const response = await fetch('https://connect.squareupsandbox.com/v2/catalog/list', {
    method: 'GET',
    headers: {
      'Square-Version': '2024-04-17',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const items = data.objects?.filter(item => item.type === 'ITEM') || [];
  res.json(items);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
