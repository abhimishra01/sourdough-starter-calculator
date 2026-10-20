# Fix summary (Carol, 2026-10-20)

## Fixed
Logic (all with tests, 20 to 31 tests):
- Tiny or lopsided custom ratios, NaN/Infinity and huge results are refused (min starter part 0.01, spread cap 1000, result cap 10,000,000 g).
- Amounts under 1 g are refused; total mode refuses totals that round to 0 g starter or flour. Keep mode rounds the typed amount to whole grams first, so all parts use the same number.
- Minus button no longer raises the value; step is symmetric (`nextAmount`).
- Cups use real fractions (1/4, 1/3, 1/2, 2/3, 3/4); no more 1/8, 3/8, 7/8.
- Hydration other than 100% on a preset: note and hint now say what the numbers are ("Feed size 1:5:5 at 80% hydration ... 5.6 parts flour and 4.4 parts water"). Custom hint grammar ("1 part") fixed.
- "-0 g", "0.5 to 1 hours", wrong-unit total in cups, cups total for mixed flour, F/C drift (exact Celsius kept), peak number shown next to a "not reliable" warning (now a dash), Copy failure (visible message plus textarea fallback), Copy follows the unit and is disabled on error.
- Total mode: exact keep/discard wording ("Keep 40 g in the jar and discard any extra first") and a rounding note. "Ripe starter" is now "Starter".
- One source of text: `feedNote`, `ratioHint`, `peakNote`, `peakText` and the 59/95 F limits live in `starter.js`; Tool, Article and FAQ use them (FAQ and article numbers are computed, thresholds now agree).
UI and accessibility:
- Phone: sticky bottom bar with starter, flour and water, hidden while the result card is on screen (both reviewers' must-fix).
- Result list is now a valid `<dl>` (flour split rows are real rows); live region is one short sentence, debounced. `aria-invalid` and a red border on the bad field; hydration box hidden for custom ratio; chip label "50% white, 50% whole wheat".
- Tap targets: FAQ rows, footer links, theme toggle (44 px). Hints 14 px. Print style. Article headings use the serif face.
SEO and content: og:image width, height, alt; removed meta keywords; JSON-LD escapes `<`; article "how much for 20/50/100/200 g" table; worked example now 110 g (clean 10/50/50); 4 new FAQ items (100 g, fridge, runny or thick, no rise).
Template list: README rewritten; US spelling (color, personalized); fixed "Last updated" (October 20, 2026); no cross-project paths; `new-tool.sh` removed; `screenshots/` and `.playwright-cli/` untracked and ignored (plus `dist-*`, `tmp-*`); duplicate home link block removed; deploy runs `npm test` first; Privacy no longer claims a banner (says Google's consent message when ads are on) and no "upload"; stale config comments fixed; header uses `site.name`.
Tailwind: `@import "tailwindcss" source(none); @source "../";`. CSS 117 KB (116K on disk) before, 21.9 KB after.

## GitHub Pages
- `astro.config.mjs` reads `PAGES_BASE` (default `/`) and `PAGES_SITE`. All links, icons, manifest (now relative) go through `src/lib/url.js`.
- Canonical stays `https://starterfeedingcalculator.com/`. Extra, not asked: the Pages build adds `noindex` so the github.io copy cannot compete with the domain. Remove `isPreview` in `Base.astro` if you want it indexed.
- `.github/workflows/pages.yml` added (checkout@v4, setup-node@v4 node 22, npm ci, npm test, build with the two env vars, upload-pages-artifact@v3, deploy-pages@v4). Branch is `main`.
- Verified locally under `/sourdough-starter-calculator/`: home, about, privacy, terms, contact load; header logo, nav and footer links keep the base; favicon, icons, og.png, manifest return 200; tool runs. dist-pages deleted.

## Rejected (and why)
- "Ready by" time of day, starter hydration input, fridge mode, shareable URL, beginner mode, larger-text option: new features, would widen a single-purpose tool. Park for the owner.
- Moving more of the page script into tested modules (maintainer 6): the pure parts (stepper, texts, cups) moved; the DOM glue stays inline, no browser test added.
- Result-over-inputs reorder: sticky bar solves it with less change.
- Sitemap `lastmod`, mid-article related links: no value yet (one tool).
- Keep chips vs stepper cut (minimalism 11): kept, useful on phones.
- Flour row "cups with mix": shows "see below" instead of a wrong number.

## Test and Lighthouse
- `npm test`: 31 passed. `npm run build`: 6 pages, clean. Screenshots at 1280 and 390, light and dark, checked.
- Lighthouse could not be re-run here (the CLI failed to start). Reviewer baseline was 100/93/100/100; the 93 came from the invalid `<dl>`, now fixed. Please re-run once.

## Left for the owner
- Buy the domain; set `ga4` and `adsense`; turn on the AdSense consent message.
- Push `main` (Barney) so the Pages workflow runs; enable Pages with source "GitHub Actions" in the repo settings.

## Phase 2 SEO pages (top 20, not built)
1. how much to feed sourdough starter
2. 1:1:1 sourdough starter feeding
3. 1:2:2 sourdough starter feeding
4. 1:5:5 sourdough starter feeding
5. 1:10:10 sourdough starter feeding
6. feed 20 g of sourdough starter
7. feed 50 g of sourdough starter
8. feed 100 g of sourdough starter
9. feed 200 g of sourdough starter
10. sourdough starter feeding schedule
11. how to feed starter from the fridge
12. how much starter to discard
13. sourdough starter peak time
14. sourdough starter feeding in cups
15. whole wheat sourdough starter feeding ratio
16. rye starter feeding ratio
17. 80% hydration starter feeding
18. 50% hydration (stiff) starter feeding
19. how to scale a starter for a recipe (total I need)
20. sourdough starter feeding ratio for a warm or cold kitchen
