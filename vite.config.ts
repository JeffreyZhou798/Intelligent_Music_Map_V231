import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',  // 使用相对路径，支持本地直接打开 HTML
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'gsap': ['gsap'],
          'd3': ['d3']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
