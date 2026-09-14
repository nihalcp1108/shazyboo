import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

export default defineConfig({
  plugins: [
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: new URL('./src/main.jsx', import.meta.url).pathname,
      additionalPrerenderRoutes: [
        '/',
        '/shop',
        '/main-category/learn-play',
        '/main-category/cozy-desk',
        '/main-category/toys',
        '/main-category/bags',
      ],
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      }
    }
  }
})
