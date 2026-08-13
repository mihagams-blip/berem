import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // `base: './'` — da igra deluje tudi, če je postrežena iz podmape
  // (GitHub Pages jo postreže na /berem/, Vercel na korenu).
  base: './',
  plugins: [react()],
  // `host: true` — igra se preizkuša na telefonu, torej mora biti dosegljiva
  // prek domačega IP-ja, ne samo na localhost.
  server: { port: 8105, strictPort: true, host: true },
  preview: { port: 8105, strictPort: true },
  // `assetsInlineLimit: 0` — pisave nikoli v base64, sicer se podvojijo.
  build: { outDir: 'dist', assetsInlineLimit: 0, target: 'es2020' }
});
