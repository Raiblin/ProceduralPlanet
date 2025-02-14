// vite.config.ts
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const basePath = process.env.VERSION ? `/versions/${process.env.VERSION}/` : '/';

export default defineConfig(({ command }) => ({
  base: basePath,
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