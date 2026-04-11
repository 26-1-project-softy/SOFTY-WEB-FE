import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@/icons': path.resolve(__dirname, 'src/assets/icons/index.ts'),
      '@/images': path.resolve(__dirname, 'src/assets/images'),
      '@': '/src',
    },
  },
});
