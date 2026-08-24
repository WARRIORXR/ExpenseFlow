import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
  },
});
