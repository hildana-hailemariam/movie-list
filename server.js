const http = require('http');
const fs = require('fs');

const PORT = 3000;

// Helper: read data
const readData = () => {
  const data = fs.readFileSync('data.json');
  return JSON.parse(data);
};

// Helper: write data
const writeData = (data) => {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {

  // GET ALL
  if (req.method === 'GET' && req.url === '/items') {
    const items = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
  }

  // GET ONE
  else if (req.method === 'GET' && req.url.startsWith('/items/')) {
    const id = parseInt(req.url.split('/')[2]);
    const items = readData();
    const item = items.find(i => i.id === id);

    if (!item) {
      res.writeHead(404);
      return res.end('Item not found');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(item));
  }

  // POST (CREATE)
  else if (req.method === 'POST' && req.url === '/items') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const newItem = JSON.parse(body);
      const items = readData();

      newItem.id = Date.now(); // simple ID
      items.push(newItem);

      writeData(items);

      res.writeHead(201);
      res.end('Item created');
    });
  }

  // PUT (UPDATE)
  else if (req.method === 'PUT' && req.url.startsWith('/items/')) {
    const id = parseInt(req.url.split('/')[2]);
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const updatedData = JSON.parse(body);
      let items = readData();

      const index = items.findIndex(i => i.id === id);

      if (index === -1) {
        res.writeHead(404);
        return res.end('Item not found');
      }

      items[index] = { ...items[index], ...updatedData };

      writeData(items);

      res.writeHead(200);
      res.end('Item updated');
    });
  }

  // DELETE
  else if (req.method === 'DELETE' && req.url.startsWith('/items/')) {
    const id = parseInt(req.url.split('/')[2]);
    let items = readData();

    const newItems = items.filter(i => i.id !== id);

    writeData(newItems);

    res.writeHead(200);
    res.end('Item deleted');
  }

  else {
    res.writeHead(404);
    res.end('Route not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
