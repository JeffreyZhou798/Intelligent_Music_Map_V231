/**
 * API Key Management Service
 * Handles secure storage and retrieval of Zhipu AI API Key in LocalStorage
 */

const STORAGE_KEY = 'intelligent_music_map_api_key'

export class ApiKeyService {
  /**
   * Save API Key to LocalStorage
   */
  static saveApiKey(key: string): void {
    if (!key || key.trim().length === 0) {
      throw new Error('API Key cannot be empty')
    }
    
    const data = {
      key: key.trim(),
      timestamp: Date.now()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  /**
   * Get API Key from LocalStorage
   */
  static getApiKey(): string | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      return parsed.key || null
    } catch (error) {
      console.error('Failed to retrieve API Key:', error)
      return null
    }
  }

  /**
   * Clear API Key from LocalStorage
   */
  static clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Validate API Key format
   * Zhipu AI keys are typically alphanumeric with dots
   */
  static validateApiKey(key: string): boolean {
    if (!key || key.trim().length === 0) {
      return false
    }
    
    // Basic format validation - at least 20 characters
    // Contains alphanumeric characters and possibly dots
    const trimmedKey = key.trim()
    if (trimmedKey.length < 20) {
      return false
    }
    
    // Check for valid characters (alphanumeric, dots, hyphens)
    const validPattern = /^[a-zA-Z0-9.-]+$/
    return validPattern.test(trimmedKey)
  }

  /**
   * Check if API Key exists
   */
  static hasApiKey(): boolean {
    return this.getApiKey() !== null
  }
}
