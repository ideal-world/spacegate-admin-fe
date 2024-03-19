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
      '/config': {
        // target: 'http://172.30.87.55:9080/',
        target: 'http://localhost:9080/',
        changeOrigin: true,
      },
      '/plugin': {
        // target: 'http://172.30.87.55:9080/',
        target: 'http://localhost:9080/',
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
