<template>
  <el-config-provider>
    <div id="app" class="app-container">
      <!-- Header -->
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon><Headset /></el-icon>
            Intelligent Music Map
          </h1>
          <div class="header-actions">
            <el-button 
              v-if="userStore.hasApiKey" 
              type="danger" 
              :icon="Delete"
              @click="handleClearApiKey"
              plain
            >
              Clear API Key
            </el-button>
            <el-button 
              v-else
              type="primary" 
              :icon="Key"
              @click="userStore.showApiKeyDialog"
            >
              Enter API Key
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="app-main">
        <router-view v-if="userStore.hasApiKey" />
        <div v-else class="welcome-screen">
          <el-empty description="Please enter your Zhipu AI API Key to get started">
            <el-button type="primary" :icon="Key" @click="userStore.showApiKeyDialog">
              Enter API Key
            </el-button>
          </el-empty>
        </div>
      </el-main>

      <!-- Footer -->
      <el-footer class="app-footer">
        <p>&copy; 2024 Intelligent Music Map - Music Education with AI</p>
      </el-footer>

      <!-- API Key Dialog -->
      <ApiKeyDialog />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider, ElHeader, ElMain, ElFooter, ElButton, ElEmpty, ElIcon, ElMessageBox } from 'element-plus'
import { Delete, Key, Headset } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import ApiKeyDialog from '@/components/ApiKeyDialog.vue'

const userStore = useUserStore()

const handleClearApiKey = async () => {
  try {
    await ElMessageBox.confirm(
      'This will remove your API Key from local storage. Continue?',
      'Clear API Key',
      {
        confirmButtonText: 'Yes, Clear It',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    userStore.clearApiKey()
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 70px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title .el-icon {
  font-size: 28px;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.welcome-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

.app-footer {
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
  height: 50px;
}

.app-footer p {
  margin: 0;
}
</style>
