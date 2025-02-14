// vite.config.ts
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/' : '/',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/CNAME', // Copy CNAME from public/
          dest: '.'           // Place it in dist/
        }
      ]
    })
  ]
}));