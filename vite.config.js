import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '', // for local use '', for test use: '/web/test_stationnement/', for production (docker) use '/stationnement/'
  publicDir: 'public',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets/*': fileURLToPath(new URL('./src/assets/', import.meta.url)),
      '@public/*': fileURLToPath(new URL('./public/', import.meta.url)),
      /*
      '@assets/*': path.resolve(__dirname, 'src/assets/*'),
      '@public/*': path.resolve(__dirname, 'public/*')
      */
    }
  }
})
