import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import themeCollector from './plugins/theme-collector'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [themeCollector(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
