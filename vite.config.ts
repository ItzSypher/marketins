import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  // PostCSS vazio: impede o Vite de herdar um postcss.config.js de uma pasta acima.
  css: { postcss: {} },
  build: {
    rollupOptions: {
      // index.html é o site (código em src/teste); anterior.html guarda a home antiga (src/main.tsx).
      input: { main: resolve(__dirname, 'index.html'), sergio: resolve(__dirname, 'sergio.html'), anterior: resolve(__dirname, 'anterior.html'), conecta: resolve(__dirname, 'conecta.html') },
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
