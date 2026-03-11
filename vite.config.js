import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // index.html está en la raíz del proyecto (requerido por Vite)
  root: '.',

  // public/ → Vite copia su contenido tal cual a dist/ (manifest.json, iconos...)
  publicDir: 'public',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-unpkg',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cloudflare',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 30 },
            },
          },
        ],
      },
      // manifest: false → usamos public/manifest.json manual
      manifest: false,
      devOptions: { enabled: false },
    }),
  ],

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',   // ← explícito: entrada en la raíz
      output: {
        manualChunks: {
          recharts: ['recharts'],
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})
