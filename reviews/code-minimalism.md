# Code review, minimalism lens (Lisbeth)

Verdict: lean and clean. No dead modules, no leftover demo code, no needless dependencies, one small logic file (159 lines) with 20 tests. 0 must-fix, 2 should-fix, 8 nice.

| # | Severity | File:line | Finding | Why | Fix |
|---|----------|-----------|---------|-----|-----|
| 1 | should | `.playwright-cli/` (28 files, tracked in git) | Browser session logs and page snapshots are committed. | Junk in history. Not on the known-leftovers list. 404 errors from `nope-404` are in the logs. | `git rm -r --cached .playwright-cli`. Add `.playwright-cli`, `tmp-*` and `dist-*` to `.gitignore`. |
| 2 | should | `src/styles/global.css:1` | The shared `dist/` CSS is 117 KB (21 KB gzip). A clean copy of the site builds to 21.8 KB. I checked by copying `src`, `public` and config to a temp folder. The extra 95 KB came from stray folders in the site directory (`tmp-*`, `dist-*`, `.playwright-cli`) that Tailwind auto-scans. | `npm run deploy` builds inside this folder. Any leftover folder can bloat the CSS 5x again. | Use `@import "tailwindcss" source(none); @source "../";` in `global.css`. Rebuild `dist/` before deploy. |
| 3 | should | `Tool.astro:7,94,258-263`; `Article.astro:7-8,12-13` | The "peak range as text" step (`peakTime` + `fToC` + `formatHours`) is written 4 times. Article strips the word "about" with `.replace('about ', '')` twice. | Four copies drift. The string surgery breaks without a warning if `formatHours` wording changes. | Add `peakText(dilution, tempF)` and a `{ prefix: false }` option (or `formatRange`) in `starter.js`. Call it from the three places. |
| 4 | nice | `Tool.astro:8` vs `starter.js:3` | `ratios` list repeats the keys of `PRESETS`. `PRESETS` is exported but only used inside `starter.js`. | Two places to edit when a ratio is added. | `[...Object.keys(PRESETS), 'custom']`. |
| 5 | nice | `Tool.astro:276-285` | Both `input` and `change` call `update()`. Number fields fire both (`change` on blur), so render and save run twice. | Needless work. Radios already fire `input` in current browsers. | One `input` listener. Keep the `tunit` conversion in it. |
| 6 | nice | `starter.js:115`; `Tool.astro:265-266` | The limits 15 and 35 live in `peakTime`. The messages hard-code "59 °F (15 °C)" and "95 °F (35 °C)". | Same number in 3 places. | Export `PEAK_MIN_C` and `PEAK_MAX_C`. Build the message from them. |
| 7 | nice | `starter.js:114` | `Math.max(dilution, 1)` cannot change anything. `dilution` is always above 1 (flour parts must be above 0). | Dead guard. | Remove it. Also `let eighths` at line 154 can be `const`. |
| 8 | nice | `global.css:56-69` | `.seg` and `.tiles` repeat the same hidden-radio overlay and focus rules. `.prose-site h3` (line 47) is not used on any page. `html` and `body` both set the background (39-40). | About 8 lines of repeat or unused CSS. | Merge shared rules (`.seg, .tiles`). Delete the `h3` rule and one background line. |
| 9 | nice | `Header.astro:2,14` | `site` is imported but not used. The name is typed by hand ("Starter Feeding Calculator"), not read from `site.name`. The class `max-[420px]:px-2` (line 21) never applies, because the nav is hidden below 640 px. | Dead import and class. Config says "one config file". | Use `{site.name}` or drop the import. Delete the dead class. |
| 10 | nice | `faq.ts` (peak answer, 1:5:5 and 1:1:1 answers); `Article.astro` | Peak hours ("3.5 to 5", "8 to 12") and the 20 g, 100 g, 220 g sums are typed by hand. Article computes its numbers from the model, so the two sources can disagree. They match today (I checked by hand). | Changing one constant in `peakTime` leaves the FAQ wrong. | Add one test that builds those FAQ numbers from `computeFeed` and `peakTime`, or compute them in `faq.ts`. |
| 11 | nice | `Tool.astro:24-26,295-300`; `global.css:80-81` | Amount has three inputs: the field, four chips and a stepper with a 5/10/50 step rule. The spec does not ask for the stepper. About 12 lines plus `.step-btn` CSS. | Owner call: spin buttons are hidden, so the stepper helps on phones. | Keep, or cut the stepper if you want the smallest page. |

## Checked and fine (no action)
- `starter.js`: no dead exports apart from #4. `roundToSum` is exported only for tests, which is fine.
- Page default values are computed in `Tool.astro` frontmatter and repeated as strings in the script (`note`, `peak-note`, `ratio-hint`). This duplication is on purpose: the page shows a real answer without JavaScript.
- Local storage save and load (16 lines) is not in the spec, but About and Privacy already describe it. Cheap. Keep.
- Rye adds an input, a row, a preset and a cup weight. The spec says "flour by type", so it earns its place.
- Dependencies: `astro`, `tailwindcss`, `@tailwindcss/vite`, `@astrojs/sitemap` all used. `wrangler` is used by `deploy.mjs`.

Known template leftovers (README, `new-tool.sh`, tracked screenshots, duplicate legal links on home, build-date "Last updated", British spelling) are on the fixer's list. Not repeated here.

Temp build folders from this review are deleted.
