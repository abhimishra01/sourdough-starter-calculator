# Sourdough starter feeding calculator

A single-purpose browser tool at starterfeedingcalculator.com. You enter how much starter you keep (or need in total), pick a feeding ratio, and get grams of starter, flour (white, whole wheat, rye) and water, plus a rough peak time by kitchen temperature. Grams or cups. No backend. Settings stay in the browser.

Astro (static) and Tailwind 4. One config file: `src/site.config.ts` (name, domain, description, email, GA4 and AdSense IDs, brand color).

## Where the logic lives
- `src/lib/starter.js`: all the math and the result text (`computeFeed`, `peakTime`, `feedNote`, `gramsToCups`, `nextAmount`). Plain JS, no build needed.
- `test/starter.test.mjs`: tests for that file. Run with `npm test`.
- `src/components/Tool.astro`: the tool markup and the page script. It calls `starter.js` and does no math of its own.
- `src/components/Article.astro` and `src/data/faq.ts`: page text. Their numbers come from `starter.js`, so they cannot drift from the tool.
- `src/lib/url.js`: `href()` builds links that work under a base path.

## Commands
- `npm run dev`: work on the site.
- `npm test`: run the logic tests.
- `npm run build`: build `dist/`.
- `npm run preview`: serve the build.
- `npm run deploy`: tests, build, then upload to Cloudflare Pages (you run `npx wrangler login` once first).

## GitHub Pages copy
The site also builds for `https://abhimishra01.github.io/sourdough-starter-calculator/` until the domain is bought. `.github/workflows/pages.yml` runs on every push to `main`. It sets `PAGES_BASE=/sourdough-starter-calculator/` and `PAGES_SITE=https://abhimishra01.github.io`. The canonical URL always points to the real domain, and the Pages copy has `noindex`. To test locally:

```
PAGES_BASE=/sourdough-starter-calculator/ npx astro build --outDir dist-pages
```

then serve `dist-pages` so it is reachable under `/sourdough-starter-calculator/`.

## Going live
1. Buy the domain (`starterfeedingcalculator.com`) and add it to Cloudflare.
2. `npm run deploy`. Add the custom domain in Cloudflare Pages.
3. For ads: set `ga4` and `adsense` in `src/site.config.ts`, turn on Google's consent message in AdSense, and rebuild.
4. Optional: replace `public/og.png` (1200x630).
