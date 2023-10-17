import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/stationnement/', // For test use: '/web/stationnement/', for production use '/stationnement/'
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
  },
  /*
  rollup: {
    external: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'],
  },
  */
  /*
  optimizeDeps: {
    include: ['pdfmake/build/vfs_fonts'],
  },
  */
  // optimizeDeps: { include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'] },
  // commonjsOptions: { exclude: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'] },
  // commonjsOptions: { }, // Edit: 

})
