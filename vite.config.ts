import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/lyrics-to-song/',
  optimizeDeps: {
    include: ['bad-words']
  },
  build: {
    commonjsOptions: {
      include: [/bad-words/, /node_modules/]
    }
  }
})
