import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    // Loại public/ khỏi file watcher để tránh reload khi debug tools hoạt động
    watch: {
      ignored: ['**/public/**', '**/dist/**', '**/node_modules/**'],
    },
    hmr: {
      // Tắt HMR overlay lỗi để tránh màn hình đỏ che game
      overlay: false,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
