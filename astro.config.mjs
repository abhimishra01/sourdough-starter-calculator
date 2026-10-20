import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// GitHub Pages builds set PAGES_BASE (for example /sourdough-starter-calculator/) and PAGES_SITE.
// A normal build uses the real domain at the root.
const base = site.bingemind ? '/sourdough-starter-calculator/' : (process.env.PAGES_BASE || '/').replace(/\/?$/, '/');

// Contact and Terms are thin pages with noindex, so they stay out of the sitemap.
const noindexFilter = (page) => !/\/(contact|terms)\/$/.test(page);

export default defineConfig({
  site: site.bingemind ? 'https://bingemind.com' : (process.env.PAGES_SITE || 'https://bingemind.com'),
  base,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap({ filter: noindexFilter })],
  vite: { plugins: [tailwindcss()] },
});
