import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';

// Плагин для копирования index.html в 404.html (для GitHub Pages SPA routing)
const copy404Plugin = () => {
  return {
    name: 'copy-404',
    closeBundle() {
      // Копируем index.html в 404.html после сборки
      const distPath = path.resolve(__dirname, 'dist');
      try {
        copyFileSync(
          path.join(distPath, 'index.html'),
          path.join(distPath, '404.html')
        );
        console.log('✓ Copied index.html to 404.html for GitHub Pages routing');
      } catch (error) {
        console.error('Failed to copy index.html to 404.html:', error);
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), copy404Plugin()],
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
  // Если ваш репозиторий называется не NutriCalc, измените '/NutriCalc/' на '/ваше-имя-репозитория/'
  base: process.env.NODE_ENV === 'production' ? '/NutriCalc/' : '/',
  publicDir: 'public',
});
