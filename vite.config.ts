import packageJson from './package.json' with { type: 'json' };
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_DEV_BACKEND_URL?.trim()
    ? env.VITE_DEV_BACKEND_URL
    : 'http://localhost:8080';

  return {
    define: { __APP_VERSION__: JSON.stringify(packageJson.version) },
    plugins: react(),
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: backendTarget, changeOrigin: true },
        '/actuator': { target: backendTarget, changeOrigin: true },
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
    build: {
      sourcemap: false,
      target: 'es2022',
      reportCompressedSize: true,
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-router'))
              return 'react';
            if (id.includes('node_modules/@tanstack')) return 'query';
            if (
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')
            )
              return 'forms';
            return undefined;
          },
        },
      },
    },
  };
});
