/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const resolvePath = (path: string) => decodeURIComponent(new URL(path, import.meta.url).pathname)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:9992/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/ai-gateway': {
        target: 'http://localhost:18080/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ai-gateway/, '')
      },
      // '/api': {
      //   target: 'http://172.30.87.40:9080/',
      //   changeOrigin: true,
      //   rewrite: path => path
      // },
    },
    hmr: {
      overlay: false
    },
    host: '0.0.0.0',
  },
  resolve: {
    dedupe: ['vue', 'vue-i18n', 'element-plus'],
    alias: {
      '@components/config': resolvePath('../spacegate-admin-front/src'),
      'spacegate-admin-client': resolvePath('../spacegate/sdk/admin-client/src'),
      'axios': resolvePath('./node_modules/axios'),
      '@': resolvePath('./src'),
    }
  },
  optimizeDeps: {
    include: [
      '@components/config',
      'spacegate-admin-client',
      'vue-i18n',
      'nanoid',
      'monaco-editor',
    ]
  }
})
