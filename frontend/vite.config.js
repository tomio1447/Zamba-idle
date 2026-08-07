import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Evita que o Vite tente escanear o arquivo de teste como entry do React
  optimizeDeps: {
    exclude: ['public/test-sprites.html']
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
