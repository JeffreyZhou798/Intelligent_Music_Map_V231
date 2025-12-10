/**
 * AI Service Factory
 * Returns Mock or Real AI service based on configuration
 */

import { config } from '@/config'
import { ZhipuAIService } from './ZhipuAIService'
import { MockAIService } from './MockAIService'

export function createAIService(apiKey: string) {
  if (config.dev.ENABLE_MOCK_MODE) {
    console.log('🎭 [MOCK MODE] Using Mock AI Service for testing')
    return new MockAIService()
  } else {
    console.log('🔌 [LIVE MODE] Using Real Zhipu AI Service')
    return new ZhipuAIService(apiKey)
  }
}
