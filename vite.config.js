import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',          // Required for Capacitor – keeps asset paths relative
  build: {
    outDir: 'dist',    // Capacitor syncs from this folder
  },
})
