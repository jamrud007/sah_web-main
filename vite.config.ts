import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Pilihan Target API Backend dari .env:
  // 'ai'  -> http://47.237.223.240:8010/ai (dengan data Teh Pucuk Harum)
  // 'dev' -> https://sah-dev.halotec.site
  const rawTarget = env.VITE_API_TARGET || 'ai';
  let apiTarget = rawTarget;
  if (rawTarget === 'ai') {
    apiTarget = 'http://47.237.223.240:8010/ai';
  } else if (rawTarget === 'dev') {
    apiTarget = 'https://sah-dev.halotec.site';
  }

  const authTarget = env.VITE_AUTH_TARGET || 'http://47.237.223.240:8010/be/api';

  return {
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
        // Auth service (Laravel)
        '/auth': {
          target: authTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth/, '/v1/auth'),
        },
        // Admin user management (Laravel)
        '/admin': {
          target: authTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/admin/, '/v1/admin'),
        },
        // Product & Photo & Scan API (FastAPI)
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
      },
    },
  };
});
