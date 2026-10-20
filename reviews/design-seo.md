# Design and SEO review: sourdough-starter-calculator

Reviewer: Miranda (independent). Date: 2026-10-20. Build: `astro build --outDir dist-design` clean (6 pages). Served on port 4466 with a static server. Viewed with playwright-cli at 1280 and 390, light and dark, plus the error, cups, mix and focus states. Lighthouse run with headless Chrome against the local build.

## Scores (Lighthouse, local build)

| Run | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 100 | 93 | 100 | 100 |
| Desktop | 100 | 93 | 100 | 100 |

LCP 0.9 s mobile, 0.3 s desktop. TBT 0 ms. CLS 0. Page weight 21 KiB (HTML 29 KB, CSS 22 KB, JS 8 KB, no fonts, no images on the page). Accessibility loses points only for the invalid definition list (row 2).

**Verdict:** Clearly better than the competitors in the research (One blog and spam copies): live answer as you type, "keep" and "total" modes, four presets plus custom, hydration, flour mix with a per-flour split, temperature with a peak guide, grams or cups, saved settings, copy button, a sticky result on desktop, real answer in the HTML before any script runs, dark mode, 21 KiB. Logo, favicon set and OG image are good. The article (about 800 words) has a computed table and a worked example whose numbers come from the same code as the tool. SEO basics are all correct. The main gap is the phone layout: the answer sits below the first screen.

**Must-fix: 2.** Should-fix: 6. Nice to have: the rest.

## Findings

| # | Severity | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | Must-fix | Phone, one thumb | At 390 x 844 the result card starts at about y 900, so the answer is below the first screen. The user types an amount, taps a ratio, and sees nothing change. Changing hydration, temperature or flour mix (all below the result) also scrolls the result out of view. The research brief asked for "fast, one-handed, messy kitchen". | Below `lg`, add a compact sticky bar at the bottom: "Starter 50 g, Flour 250 g, Water 250 g" (updates live, same `aria-live` text), or move the result card directly under the amount input and ratio tiles. Keep the full card below. |
| 2 | Must-fix | Accessibility | Lighthouse `definition-list` and `dlitem` fail (93). The `<dl>` holds `<div>` rows that contain extra `<div>`s (the flour row wraps `#flour-split` inside the same div as `dt` and `dd`). The `aria-live` region also wraps the whole list, so a screen reader reads every number on each keystroke. | Make each row `div > dt + dd` only. Move the flour split out of the `<dl>` or make it a nested `<dl>`. Put `aria-live` on a short sentence (for example "Feed 50 g starter, 250 g flour, 250 g water") and remove it from the list. |
| 3 | Should-fix | Cups mode | In Cups the "Total after feeding" row still shows "550 g", so one card mixes units. Copy amounts always copies grams, whatever the toggle says. | Show the total in cups too (or label it "550 g total" on purpose), and make Copy follow the unit. |
| 4 | Should-fix | Error state | With an empty or invalid amount the card shows dashes and a red sentence (good), but Copy amounts stays active and does nothing, and the inputs have no `aria-invalid` or `aria-describedby` link to the message. No red border on the bad field. | Disable Copy on error. Set `aria-invalid="true"` on the bad input and point `aria-describedby` at `#note`. Add a red border on the field. |
| 5 | Should-fix | Tap targets | Footer links are 17 to 20 px tall. FAQ `summary` rows are 24 px tall (the padding is on `details`, not `summary`). Theme toggle is 40 px. The inline link row under the tool (About, Privacy, Terms, Contact) is 17 px tall and repeats the footer. | Put `py-4` on `summary` so the whole row taps. Give footer links `py-2`. Make the toggle 44 px. Remove the inline link row under the tool, or keep it only if the playbook needs the links on the home page above the fold (the footer already meets that). |
| 6 | Should-fix | Content depth for the main query | The article covers the basics but misses the long-tail questions bakers type most: "how much to feed 100 g / 20 g starter", "starter from the fridge", "how much to discard", "starter too runny or too thick", "when to feed (peak vs fall)". FAQ has 7 items and none covers fridge storage steps, discard maths or the float test. | Add 3 to 4 FAQ items (fridge revival, feeding 20 g and 100 g at 1:5:5 with exact grams, runny or hungry starter, what to do if it does not peak). Add a small "amounts at a glance" table for 20, 50, 100, 200 g at 1:5:5 and 1:1:1. Aim for 1,000 to 1,200 words of article text. |
| 7 | Should-fix | Feature gap vs research | The research panel asked for an "I want 200 g of starter by 8 am" mode. The page gives only a peak window, not a start time. | Add an optional "ready by" time input that prints "Feed at about 9 pm" from the peak range. If it is out of scope, leave it, but then drop nothing: the title promise ("Ratio and Peak Time") is still met. |
| 8 | Nice | Worked example | The example for 120 g at 1:5:5 shows "11 g starter, 55 g flour, 54 g water". A baker will ask why equal parts differ by 1 g. The rounding is correct (10.9, 54.5, 54.5 sum to 120). | Pick an example that divides cleanly (110 g gives 10, 50, 50) or add "(rounded to whole grams)" after the numbers. |
| 9 | Nice | Typography | Tool headings and H1 use the serif face. Article H2s and the FAQ heading use the sans face. The split reads as two styles on one page. | Use `.serif` on article H2s and the FAQ H2, or leave the serif for numbers and H1 only. |
| 10 | Nice | Navigation on phone | About and Contact are hidden below 640 px. Only the footer reaches them. | Keep (clean header), or add an About link to the footer's first row (already there). No action needed unless you want a menu. |
| 11 | Nice | Small text | Hints are 13 px and the cups note is 12 px. Contrast passes (muted text about 5.6:1 on the tinted card, brand on white 5.4:1). | Raise the cups note and hints to 14 px if there is space. |
| 12 | Nice | Print | No print style. Bakers print feeding charts. | Add a short `@media print` that hides the header, footer and FAQ and shows the table and result. |
| 13 | Low | OG and meta | `og:image` has no width, height or alt. `<meta name="keywords">` is ignored by Google. The OG image is good (logo, title, live-looking card). | Add `og:image:width=1200`, `og:image:height=630`, `og:image:alt`. Remove the keywords tag. |
| 14 | Low | Sitemap | `sitemap-0.xml` has no `lastmod`. Valid and small (5 URLs, 404 excluded). | Optional: add `lastmod` through the sitemap `serialize` option. |
| 15 | Low | Internal links | The article has no links to other pages and the site is one tool page. There is nothing to link to yet. | When a second tool exists, add a "related tools" block. Until then, nothing. |
| 16 | Info | SEO pass | Title: 57 characters, keyword first. Meta description: 138 characters, has 1:1:1 and 1:5:5. One H1 matching the title. H2 outline is clean (11 H2, no H3, no skipped levels). Canonical is the real domain with a trailing slash, matching the sitemap. Both JSON-LD blocks parse (WebApplication, FAQPage; FAQ text matches the page). robots.txt allows all and points to `sitemap-index.xml`. `_headers` sets noindex on pages.dev only. | None. Note: Google now shows FAQ rich results for very few sites, so do not count on them. |
| 17 | Info | Visual design | Warm paper and brand-orange palette suits baking. Jar icon works at 16 px, 32 px (favicon-32), 180 px and 512 px. Dark mode is clean: no flash, good contrast, pressed states clear. Result numbers in serif at 30 px are easy to read at arm's length. Focus rings are 2 px and visible (checked on the ratio tiles and buttons). No horizontal scroll at 390. | None. |
| 18 | Info | Maths spot check | 50 g at 1:5:5 gives 250 and 250 (550 total). 50 g at 80% hydration, mix 80/20 and cups all returned consistent numbers. Cups for 50 g starter shows "3 1/2 tbsp", sensible. Amount below 1 and empty input give a clear message. 1,000,000 g is refused with a clear message. | None. |

## Competitors check

Page-1 rivals in the research are one blog (That Sourdough Gal) and scraped copies. This page beats them on speed, mobile layout, flour mix, temperature guide and honesty about cups. To pull ahead on the main query, close row 6 (more long-tail answers) and row 7 (ready-by time).
