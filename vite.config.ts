import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // PostCSS vazio: impede o Vite de herdar o postcss.config.js (Tailwind) de
  // uma pasta acima quando o projeto roda dentro de outro repositório.
  css: { postcss: {} },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
