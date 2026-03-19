import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: true,   // ← exposes to local network (needed for phone access)
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5005',
        ws: true,
      },
    },
  },

  build: {
    // Warn when a single chunk exceeds 600 kB
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // ── Split heavy vendor libraries into their own cached chunks ──────
        // These rarely change, so browsers cache them across deployments.
        manualChunks(id) {
          // 1. Separate native Leaflet (heavy, no React dependency)
          if (id.includes('node_modules/leaflet/')) {
            return 'vendor-leaflet'
          }
          // 2. Put EVERYTHING strictly React-related into one combined chunk.
          // This safely catches react, react-dom, react-router-dom, react-hot-toast,
          // react-leaflet, and @react-leaflet/core so they never lose context.
          if (id.includes('node_modules/react') || id.includes('node_modules/@react-') || id.includes('node_modules/scheduler')) {
            return 'vendor-react'
          }
          // 3. Socket.io client
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) {
            return 'vendor-socket'
          }
          // 4. Lenis smooth scroll
          if (id.includes('node_modules/lenis')) {
            return 'vendor-lenis'
          }
          // 5. Everything else
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
