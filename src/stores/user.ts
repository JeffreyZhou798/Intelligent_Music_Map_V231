/**
 * User Store
 * Manages API Key and user preferences
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiKeyService } from '@/services/ApiKeyService'
import { PreferenceLearner } from '@/services/PreferenceLearner'
import type { UserPreferences, UserAction } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const apiKey = ref<string | null>(null)
  const preferenceLearner = ref<PreferenceLearner>(new PreferenceLearner())
  const isApiKeyDialogVisible = ref(false)

  // Getters
  const hasApiKey = computed(() => apiKey.value !== null)
  const preferences = computed<UserPreferences>(() => preferenceLearner.value.getPreferences())

  // Actions
  function loadApiKey() {
    const key = ApiKeyService.getApiKey()
    if (key) {
      apiKey.value = key
      return true
    }
    return false
  }

  function saveApiKey(key: string) {
    if (!ApiKeyService.validateApiKey(key)) {
      throw new Error('Invalid API Key format')
    }
    ApiKeyService.saveApiKey(key)
    apiKey.value = key
    isApiKeyDialogVisible.value = false
  }

  function clearApiKey() {
    ApiKeyService.clearApiKey()
    apiKey.value = null
  }

  function showApiKeyDialog() {
    isApiKeyDialogVisible.value = true
  }

  function hideApiKeyDialog() {
    isApiKeyDialogVisible.value = false
  }

  function recordUserAction(action: UserAction) {
    preferenceLearner.value.recordAction(action)
  }

  function clearPreferences() {
    preferenceLearner.value.clearPreferences()
  }

  function getPreferenceStatistics() {
    return preferenceLearner.value.getStatistics()
  }

  // Initialize on store creation
  loadApiKey()

  return {
    // State
    apiKey,
    isApiKeyDialogVisible,
    
    // Getters
    hasApiKey,
    preferences,
    
    // Actions
    loadApiKey,
    saveApiKey,
    clearApiKey,
    showApiKeyDialog,
    hideApiKeyDialog,
    recordUserAction,
    clearPreferences,
    getPreferenceStatistics
  }
})
