import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // This makes the server accessible on your local network
    port: 5173, // You can change this port if needed
    // Дополнительные настройки для сетевого доступа:
    // strictPort: true, // Не использовать другой порт если 5173 занят
    // https: false, // Отключить HTTPS (по умолчанию)
    // open: true, // Автоматически открывать браузер при запуске
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
  // Настройки для GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/NutriCalc/' : '/',
});
