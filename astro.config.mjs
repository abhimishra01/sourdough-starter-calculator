import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// GitHub Pages builds set PAGES_BASE (for example /sourdough-starter-calculator/) and PAGES_SITE.
// A normal build uses the real domain at the root.
const base = site.bingemind ? '/sourdough-starter-calculator/' : (process.env.PAGES_BASE || '/').replace(/\/?$/, '/');

export default defineConfig({
  site: site.bingemind ? 'https://bingemind.com' : (process.env.PAGES_SITE || 'https://bingemind.com'),
  base,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
