import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8051,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      // Auth service (Laravel) — login, logout, me, password, user management
      '/auth': {
        target: 'http://47.237.223.240:8010/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/v1/auth'),
      },
      // Admin user management (Laravel)
      '/admin': {
        target: 'http://47.237.223.240:8010/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/admin/, '/v1/admin'),
      },
      // Product & Photo & Scan API (FastAPI / sah-dev)
      '/api': {
        target: 'https://sah-dev.halotec.site',
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
});
