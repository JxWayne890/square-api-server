app.get('/products', async (req, res) => {
  try {
    const response = await fetch('https://connect.squareupsandbox.com/v2/catalog/list', {
      method: 'GET',
      headers: {
        'Square-Version': '2024-04-17',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('All catalog data:', data); // 🟡 This helps us see what's really coming through
    const products = data.objects || []; // Remove filter temporarily
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Square API error' });
  }
});
