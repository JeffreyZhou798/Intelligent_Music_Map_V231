/**
 * Vercel Serverless Function for Zhipu AI API Proxy
 * This function handles CORS and proxies requests to Zhipu AI API
 */

export default async function handler(req, res) {
  // Enable CORS - Allow all origins and necessary headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization'
  )

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get API key from environment variable or request header
    const apiKey = process.env.ZHIPU_API_KEY || req.headers['x-api-key']
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key not configured. Please set ZHIPU_API_KEY environment variable in Vercel.' 
      })
    }

    console.log('Proxying request to Zhipu AI...')
    console.log('Model:', req.body.model)

    // Forward request to Zhipu AI API
    const response = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Zhipu AI API error:', response.status, errorData)
      return res.status(response.status).json({
        error: errorData.error || 'API request failed',
        details: errorData
      })
    }

    const data = await response.json()
    console.log('✓ Response received from Zhipu AI')
    
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('✗ Error calling Zhipu AI:', error.message)
    
    return res.status(500).json({
      error: 'Failed to connect to Zhipu AI API',
      message: error.message
    })
  }
}
