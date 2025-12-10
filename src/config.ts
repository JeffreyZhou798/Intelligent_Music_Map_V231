/**
 * Application Configuration
 */

// Detect if running on Vercel
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'

export const config = {
  /**
   * Zhipu AI API Configuration
   * 
   * Automatically detects environment:
   * - Vercel: Uses /api/zhipu serverless function
   * - Localhost: Uses local proxy at http://localhost:3002
   * - Direct: Direct API calls (will fail due to CORS)
   */
  zhipuAI: {
    USE_PROXY: true, // Always use proxy to avoid CORS
    PROXY_URL: isVercel 
      ? '/api/zhipu'  // Vercel serverless function
      : 'http://localhost:3002/api/zhipu/chat/completions', // Local proxy
    DIRECT_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    MODEL: 'glm-4.5-air'
  },

  /**
   * Development settings
   */
  dev: {
    ENABLE_LOGS: true,
    ENABLE_MOCK_MODE: false // Set to false to use real Zhipu AI API
  },

  /**
   * Environment info
   */
  env: {
    isVercel,
    isLocalhost,
    isDevelopment: isLocalhost
  }
}

/**
 * Get the correct API base URL based on environment
 */
export function getAPIBaseURL(): string {
  if (config.zhipuAI.USE_PROXY) {
    console.log(`🌐 [Config] Using proxy: ${config.zhipuAI.PROXY_URL}`)
    return config.zhipuAI.PROXY_URL
  }
  console.log(`🌐 [Config] Using direct API: ${config.zhipuAI.DIRECT_URL}`)
  return config.zhipuAI.DIRECT_URL
}
