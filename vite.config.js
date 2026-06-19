import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/sql': {
        target: 'http://host.docker.internal:8080',
        changeOrigin: true,
      },
    },
  },
})
