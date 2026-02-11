import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://provisionlands.co.ke',
          changeOrigin: true,
          secure: false, // In case of SSL issues, though production usually has valid certs
        }
      }
    },
    plugins: [react()],
    define: {
      // No need to define process.env variables since we're using import.meta.env directly
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
