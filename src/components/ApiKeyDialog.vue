<template>
  <el-dialog
    v-model="userStore.isApiKeyDialogVisible"
    title="Enter API Key"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form @submit.prevent="handleSubmit">
      <el-form-item>
        <el-alert
          title="API Key Storage"
          type="info"
          :closable="false"
          show-icon
        >
          Your Zhipu AI API Key will be stored locally in your browser only. It will never be uploaded to any server.
        </el-alert>
      </el-form-item>
      
      <el-form-item label="API Key">
        <el-input
          v-model="apiKeyInput"
          type="password"
          placeholder="Please enter your Zhipu AI API Key"
          show-password
          clearable
          size="large"
        />
      </el-form-item>

      <el-form-item>
        <el-text type="info" size="small">
          Don't have an API Key? Visit 
          <el-link href="https://open.bigmodel.cn" target="_blank" type="primary">
            Zhipu AI Platform
          </el-link>
          to get one.
        </el-text>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!apiKeyInput"
        >
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElAlert, ElText, ElLink, ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const apiKeyInput = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!apiKeyInput.value) {
    ElNotification({
      title: 'Error',
      message: 'Please enter your API Key',
      type: 'error',
      duration: 0
    })
    return
  }

  isSubmitting.value = true
  
  try {
    userStore.saveApiKey(apiKeyInput.value)
    
    ElNotification({
      title: 'Success',
      message: 'API Key saved successfully',
      type: 'success',
      duration: 3000
    })
    
    apiKeyInput.value = ''
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: error instanceof Error ? error.message : 'Failed to save API Key',
      type: 'error',
      duration: 0
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  userStore.hideApiKeyDialog()
  apiKeyInput.value = ''
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
}
</style>
