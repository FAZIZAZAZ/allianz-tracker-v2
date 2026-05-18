const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

const BIN_ID = '6a0ae32bc0954111d83e7efe';
const API_KEY = '$2a$10$ffk0IK2fLWCSd8DmDNgCaOUS3EiXiPz0FUFApxAFfuVLd2CmbQ9qK';

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

function jsonbinRequest(method, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${BIN_ID}`,
      method: method,
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

app.get('/api/data', async (req, res) => {
  try {
    const result = await jsonbinRequest('GET');
    res.json(result.record || { mas: [] });
  } catch (e) {
    console.error('GET error:', e);
    res.json({ mas: [] });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    await jsonbinRequest('PUT', req.body);
    res.json({ ok: true });
  } catch (e) {
    console.error('POST error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
