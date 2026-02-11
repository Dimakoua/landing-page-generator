import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import themeCollector from './plugins/theme-collector'

// https://vite.dev/config/
export default defineConfig({
  plugins: [themeCollector(), react()],
})
