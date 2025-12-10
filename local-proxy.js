/**
 * Local Proxy Server for Development
 * Solves CORS issue when calling Zhipu AI API locally
 * 
 * Run: node local-proxy.js
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/api/zhipu/chat/completions', async (req, res) => {
  // Get API key from request header or environment variable
  const apiKey = req.headers['x-api-key'] || process.env.ZHIPU_API_KEY || '';
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key not provided' });
  }
  
  console.log('📤 Proxying request to Zhipu AI...');
  console.log('Model:', req.body.model);
  
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Zhipu AI Error:', response.status, errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('✅ Response received from Zhipu AI');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local proxy server is running' });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('  Local Proxy Server for Zhipu AI');
  console.log('='.repeat(50));
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/zhipu/chat/completions`);
  console.log('='.repeat(50));
});
