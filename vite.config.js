import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        // Incrementar cacheId fuerza a Safari/iOS a descartar la caché antigua
        cacheId: 'enfescalsol-v1.1',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // Nunca cachear index.html — siempre buscar la versión más reciente
        navigateFallbackDenylist: [],
        cleanupOutdatedCaches: true,
        skipWaiting: true,        // Activa el nuevo SW sin esperar a cerrar tabs
        clientsClaim: true,       // El nuevo SW toma el control inmediatamente
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-unpkg-v2',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cloudflare-v2',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 30 },
            },
          },
        ],
      },
      manifest: false,
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: { recharts: ['recharts'] },
      },
    },
  },
  server: { port: 3000, open: true },
})
