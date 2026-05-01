import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/Mn-game/',          // для GitHub Pages
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
