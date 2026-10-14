import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true, // ← exposes to local network (needed for phone access)
    port: 5173, // ← default Vite port
    proxy: {
      "/api": {
        target: "http://localhost:5005",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code !== "ECONNRESET" && err.code !== "ECONNABORTED") {
              console.error("[proxy /api] error:", err.message);
            }
          });
        },
      },
      "/socket.io": {
        target: "http://localhost:5005",
        changeOrigin: true, // ← fixes Origin header mismatch
        rewriteWsOrigin: true, // ← required in Vite 5+ for ws upgrades
        ws: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code !== "ECONNRESET" && err.code !== "ECONNABORTED") {
              console.error("[proxy /socket.io] error:", err.message);
            }
          });
        },
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const normalized = id.replace(/\\/g, "/");
            if (normalized.includes("/leaflet") || normalized.includes("/react-leaflet")) {
              return "vendor-maps";
            }
            if (normalized.includes("/framer-motion") || normalized.includes("/lenis")) {
              return "vendor-motion";
            }
            if (normalized.includes("/lucide-react") || normalized.includes("/react-hot-toast")) {
              return "vendor-ui";
            }
            if (normalized.includes("/socket.io-client") || normalized.includes("/engine.io-client")) {
              return "vendor-socket";
            }
            if (normalized.includes("/libphonenumber-js")) {
              return "vendor-phone";
            }
            if (
              normalized.includes("/react-router-dom") ||
              normalized.includes("/react-router") ||
              normalized.includes("/react-dom") ||
              normalized.includes("/react/") ||
              normalized.includes("/react-helmet-async")
            ) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },
});
