import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Use the repo-level public directory so existing public assets are preserved
  publicDir: '../public',
  resolve: {
    alias: [
      // allow imports like `@/components/...` to resolve to frontend/src
      { find: '@', replacement: path.resolve(__dirname, 'src') }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
