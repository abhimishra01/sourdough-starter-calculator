// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
// SITE_MODE=bingemind builds the public copy at bingemind.com/<slug>/.
const bingemind = process.env.SITE_MODE === 'bingemind';
export default {
  name: 'Starter Feeding Calculator',                 // shown in header, title, footer
  domain: 'bingemind.com/sourdough-starter-calculator',   // canonical host + path, no https://. Sites live at bingemind.com/<slug>/            // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'sourdough-starter-calculator',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'sourdough starter feeding calculator',            // main keyword (only used to build a title when "title" is empty)
  keywords: ['sourdough starter feeding ratio', '1:5:5 starter feeding', 'sourdough starter ratio calculator', 'how much to feed sourdough starter', 'starter peak time'], // supporting keywords
  title: 'Sourdough Starter Feeding Calculator: Ratio and Peak Time', // <title> of the home page, main keyword first, under 60 chars
  tagline: 'Free, instant and private',  // short line in the badge above the home page heading
  description:
    'Free sourdough starter feeding calculator. Get grams of starter, flour and water for 1:1:1, 1:5:5 or any ratio, plus a rough peak time.',
  email: 'hello@starterfeedingcalculator.com',
  // Bingemind build (SITE_MODE=bingemind): owner is Bingemind, contact goes to the Bingemind contact section (no invented email).
  bingemind,
  contactHref: bingemind ? 'https://bingemind.com/#contact' : 'mailto:' + 'hello@starterfeedingcalculator.com',
  contactLabel: bingemind ? 'bingemind.com/#contact' : 'hello@starterfeedingcalculator.com',
  contactLead: bingemind ? 'Contact:' : 'Email:',       // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#854d0e',                   // brand color (hex)
  skin: 'clay',                       // look: minimal, swiss, clay or retro
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',                        // e.g. '/og.png' (1200x630 file in public/). Empty = no image
  category: 'LifestyleApplication',   // schema.org applicationCategory
  owner: bingemind ? 'Bingemind' : 'Starter Feeding Calculator',                // name used in legal pages (person or business)
};
