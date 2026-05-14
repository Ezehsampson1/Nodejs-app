const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;


const register = new client.Registry();


client.collectDefaultMetrics({ register });


const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});


app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

app.get('/', (req, res) => {
  res.json({ message: "Engr Sampson's DevOps pipeline is live! wonderful!!!", version: '3.0.0' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});


app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});