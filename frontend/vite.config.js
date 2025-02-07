import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Permet d’accéder au serveur depuis localhost
    port: 5173,   // Définit le port explicitement
    strictPort: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
});
