import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Necessary for sockjs-client in Vite
    global: 'window',
  },
  server: {
    port: 5173,
    host: true,
  },
});
