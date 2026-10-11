import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  // PostCSS vazio: impede o Vite de herdar um postcss.config.js de uma pasta acima.
  css: { postcss: {} },
  build: {
    rollupOptions: {
      // Prévia do design system como página separada; o site continua em index.html.
      input: { main: resolve(__dirname, 'index.html'), sergio: resolve(__dirname, 'sergio.html'), teste: resolve(__dirname, 'teste.html'), conecta: resolve(__dirname, 'conecta.html') },
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
