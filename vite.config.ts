/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vitejs.dev/config/
console.log(path.resolve(__dirname, './components/config'))
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000,
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/config': {
        // target: 'http://192.168.31.164:9080/',
        target: 'http://localhost:9001/',
        changeOrigin: true,
      }
    },
    hmr: {
      overlay: false
    },
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@components/config': path.resolve(__dirname, './components/config'),
      "@": path.resolve("./src")
    }
  },
  optimizeDeps: {
    include: [
      '@components/config'
    ]
  }
})
