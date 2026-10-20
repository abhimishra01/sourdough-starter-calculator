// Core logic for the starter feeding calculator. Plain JS so node can test it without a build.
// The text the page shows about a result is built here too, so the first paint (rendered at
// build time) and the live page (rendered in the browser) always say the same thing.

const PRESETS = { '1:1:1': 1, '1:2:2': 2, '1:5:5': 5, '1:10:10': 10 };
export const RATIO_KEYS = [...Object.keys(PRESETS), 'custom'];

// Rough grams per US cup. Cups vary a lot with how you scoop, so the page says grams are better.
const GRAMS_PER_CUP = { starter: 227, white: 120, wheat: 113, rye: 102, water: 237 };

const HYDRATION_MIN = 40;
const HYDRATION_MAX = 150;
const MAX_AMOUNT = 100000;
const MAX_RESULT = 10000000; // grams, any single result
const MIN_CUSTOM_PART = 0.01;
const MAX_CUSTOM_SPREAD = 1000; // flour or water parts per part of starter

// The peak guide is only trusted between these temperatures.
export const PEAK_MIN_C = 15;
export const PEAK_MAX_C = 35;
export const COLD_F = 59; // PEAK_MIN_C in Fahrenheit
export const HOT_F = 95; // PEAK_MAX_C in Fahrenheit

const fail = (error, field) => ({ ok: false, error, field });

/**
 * Work out the parts of one feeding.
 * opts.mode: 'keep' (grams of starter you keep) or 'total' (grams of starter you want in all)
 * opts.ratio: a key of RATIO_KEYS
 * opts.custom: { s, f, w } parts of starter, flour, water (used when ratio is 'custom')
 * opts.hydration: percent water to flour in the feed (presets only)
 * opts.mix: { wheat, rye } percent of the flour that is whole wheat or rye
 * On bad input it returns { ok: false, error, field } where field names the input to flag.
 */
export function computeFeed(opts) {
  const amount = Number(opts.amount);
  if (!Number.isFinite(amount) || amount < 1) return fail('Enter an amount of at least 1 gram.', 'amount');
  if (amount > MAX_AMOUNT) return fail('That amount is too large. Try 100,000 g or less.', 'amount');
  const grams = Math.round(amount); // the page works in whole grams

  const wheatPct = Number(opts.mix?.wheat ?? 0);
  const ryePct = Number(opts.mix?.rye ?? 0);
  if (![wheatPct, ryePct].every(Number.isFinite) || wheatPct < 0 || ryePct < 0) {
    return fail('Flour mix percentages must be 0 or more.', 'mix');
  }
  if (wheatPct + ryePct > 100.0001) {
    return fail('Whole wheat and rye add up to more than 100%.', 'mix');
  }

  // sp, fp, wp = parts of starter, flour, water
  let sp, fp, wp, hydration;
  if (opts.ratio === 'custom') {
    sp = Number(opts.custom?.s);
    fp = Number(opts.custom?.f);
    wp = Number(opts.custom?.w);
    if (![sp, fp, wp].every(Number.isFinite) || sp <= 0 || fp <= 0 || wp < 0) {
      return fail('Enter parts above 0 for starter and flour, and 0 or more for water.', 'custom');
    }
    if (sp < MIN_CUSTOM_PART) return fail(`The starter part must be at least ${MIN_CUSTOM_PART}.`, 'custom');
    if (fp / sp > MAX_CUSTOM_SPREAD || wp / sp > MAX_CUSTOM_SPREAD) {
      return fail('Those ratio numbers are too far apart. Use a smaller flour or water part.', 'custom');
    }
    if (sp + fp + wp > 5000) return fail('Those ratio numbers are too large.', 'custom');
    hydration = (wp / fp) * 100;
  } else {
    const presetParts = PRESETS[opts.ratio];
    if (!presetParts) return fail('Pick a feeding ratio.', 'ratio');
    const h = Number(opts.hydration);
    if (!Number.isFinite(h) || h < HYDRATION_MIN || h > HYDRATION_MAX) {
      return fail(`Hydration must be between ${HYDRATION_MIN}% and ${HYDRATION_MAX}%.`, 'hydration');
    }
    hydration = h;
    const feed = 2 * presetParts; // parts of flour plus water per 1 part of starter
    sp = 1;
    fp = feed / (1 + h / 100);
    wp = feed - fp;
  }

  const sumParts = sp + fp + wp;
  const scale = opts.mode === 'total' ? grams / sumParts : grams / sp;
  const whiteShare = Math.max(0, 1 - (wheatPct + ryePct) / 100);
  // Order: starter, white flour, whole wheat flour, rye flour, water.
  const raw = [
    sp * scale,
    fp * scale * whiteShare,
    fp * scale * (wheatPct / 100),
    fp * scale * (ryePct / 100),
    wp * scale,
  ];
  if (!raw.every(Number.isFinite) || raw.some((v) => v > MAX_RESULT)) {
    return fail('That result is too large. Check the ratio numbers.', 'custom');
  }

  let rounded;
  if (opts.mode === 'total') {
    rounded = roundToSum(raw, grams);
  } else {
    rounded = raw.map((v) => Math.round(v));
    rounded[0] = grams;
  }
  const [starter, white, wheat, rye, water] = rounded;
  const flourTotal = white + wheat + rye;
  if (starter < 1 || flourTotal < 1) {
    return fail('That total is too small to split into whole grams. Try a larger amount.', 'amount');
  }
  return {
    ok: true,
    mode: opts.mode === 'total' ? 'total' : 'keep',
    starter,
    flour: { white, wheat, rye, total: flourTotal },
    water,
    total: starter + flourTotal + water,
    hydration,
    parts: { s: sp, f: fp, w: wp },
    isPreset: opts.ratio !== 'custom',
    dilution: sumParts / sp, // how many times the starter is diluted by the feeding
    ratioLabel: opts.ratio === 'custom' ? `${round2(sp)}:${round2(fp)}:${round2(wp)}` : opts.ratio,
    wholeGrainShare: wheatPct + ryePct,
  };
}

const round2 = (n) => String(Math.round(n * 100) / 100);
const round1 = (n) => Math.round(n * 10) / 10;
const partsWord = (n) => (n === 1 ? 'part' : 'parts');

// Round every value to a whole number while keeping the sum equal to `target` (largest remainder).
export function roundToSum(values, target) {
  const floors = values.map(Math.floor);
  let left = target - floors.reduce((a, b) => a + b, 0);
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; left > 0 && k < order.length; k++, left--) floors[order[k].i] += 1;
  return floors;
}

/** The instruction under the result. */
export function feedNote(res) {
  const h = round1(res.hydration);
  // A preset at a hydration other than 100% no longer means equal flour and water, so say what it does mean.
  const ratioText = res.isPreset && h !== 100
    ? `Feed size ${res.ratioLabel} at ${h}% hydration.`
    : `Ratio ${res.ratioLabel} by weight, ${h}% hydration.`;
  return res.mode === 'keep'
    ? `Keep ${res.starter} g of starter in the jar and discard the rest. Then add the flour and water. ${ratioText}`
    : `Mix ${res.starter} g of starter with the flour and water to get ${res.total} g. Keep ${res.starter} g in the jar and discard any extra first. ${ratioText} Amounts are rounded to whole grams.`;
}

/** The line under the ratio tiles. */
export function ratioHint(res) {
  const { s, f, w } = res.parts;
  if (res.isPreset && round1(res.hydration) !== 100) {
    return `${res.ratioLabel} sets the feed size: ${round1(f + w)} parts of flour and water for each part of starter. At ${round1(res.hydration)}% hydration that is ${round1(f)} parts flour and ${round1(w)} parts water.`;
  }
  const n = round2;
  return `${res.ratioLabel} means ${n(s)} ${partsWord(s)} starter, ${n(f)} ${partsWord(f)} flour and ${n(w)} ${partsWord(w)} water, by weight.`;
}

/**
 * Rough peak time in hours for a starter fed at a given dilution and kitchen temperature (Celsius).
 * Anchors at 77 F (25 C): 1:1:1 about 4 h, 1:2:2 about 6 h, 1:5:5 about 9 h, 1:10:10 about 12 h.
 * Every 10 C warmer halves the time. This is a guide only.
 * The hours are clamped to PEAK_MIN_C..PEAK_MAX_C; the cold and hot flags use the real temperature.
 */
export function peakTime(dilution, tempC) {
  if (!Number.isFinite(dilution) || !Number.isFinite(tempC)) return { ok: false };
  const base = Math.max(1.5, 4 + 4.1 * Math.log(dilution / 3));
  const t = Math.min(PEAK_MAX_C, Math.max(PEAK_MIN_C, tempC));
  const mid = base * Math.pow(2, (25 - t) / 10);
  return {
    ok: true,
    mid,
    low: mid * 0.8,
    high: mid * 1.2,
    cold: tempC < PEAK_MIN_C,
    hot: tempC > PEAK_MAX_C,
  };
}

// "about 5 to 7 hours". Rounds to the nearest half hour, or whole hour for long waits.
export function formatHours(low, high) {
  const step = high >= 8 ? 1 : 0.5;
  const r = (h) => Math.round(h / step) * step;
  const a = r(low);
  const b = r(high);
  const f = (h) => (Number.isInteger(h) ? String(h) : h.toFixed(1));
  if (b >= 24) return 'about a day or more';
  if (a === b) return `about ${f(a)} ${a === 1 ? 'hour' : 'hours'}`;
  return `about ${f(a)} to ${f(b)} ${b <= 1 ? 'hour' : 'hours'}`;
}

/** Peak range as text for a dilution and a Fahrenheit temperature. Pass bare: true to drop "about". */
export function peakText(dilution, tempF, { bare = false } = {}) {
  const p = peakTime(dilution, fToC(tempF));
  const text = formatHours(p.low, p.high);
  return bare ? text.replace(/^about /, '') : text;
}

/** The small note under the peak time. `t` is the temperature as typed, in `unit` ('F' or 'C'). */
export function peakNote(pk, t, unit, wholeGrainShare) {
  if (pk.cold) return `Below ${COLD_F} °F (${PEAK_MIN_C} °C) a starter slows a lot, so no time is shown. Find a warmer spot.`;
  if (pk.hot) return `Above ${HOT_F} °F (${PEAK_MAX_C} °C) a starter can struggle, so no time is shown. Find a cooler spot.`;
  let msg = `At ${round1(t)} °${unit}. A guide only: your flour, starter and kitchen will change it. Watch the jar, not the clock.`;
  if (wholeGrainShare >= 30) msg += ' Whole grain flour often peaks sooner.';
  return msg;
}

export const fToC = (f) => ((f - 32) * 5) / 9;
export const cToF = (c) => (c * 9) / 5 + 32;

// Step for the amount buttons. Bigger amounts move in bigger steps, and up and down are symmetric.
const stepAt = (v) => (v >= 200 ? 50 : v >= 50 ? 10 : 5);
export function nextAmount(current, direction) {
  const cur = Number.isFinite(current) && current > 0 ? current : 0;
  if (direction === 'up') return Math.round((cur + stepAt(cur)) * 100) / 100;
  return Math.max(1, Math.round((cur - stepAt(cur - 0.001)) * 100) / 100);
}

// Fractions of a cup a baker can actually measure: 1/4, 1/3, 1/2, 2/3, 3/4.
const CUP_FRACTIONS = [[0, ''], [1 / 4, '¼'], [1 / 3, '⅓'], [1 / 2, '½'], [2 / 3, '⅔'], [3 / 4, '¾'], [1, '']];

/** Grams to a kitchen measure, such as "1 ½ cups" or "3 tbsp". */
export function gramsToCups(grams, kind) {
  const per = GRAMS_PER_CUP[kind];
  if (!per || !(grams > 0)) return '0 cups';
  const cups = grams / per;
  if (cups < 0.25) {
    const tbsp = Math.max(0.5, Math.round(cups * 16 * 2) / 2);
    const w = Math.floor(tbsp);
    return `${w > 0 ? w : ''}${tbsp % 1 ? (w > 0 ? ' ' : '') + '½' : ''} tbsp`;
  }
  let whole = Math.floor(cups);
  const frac = cups - whole;
  let best = CUP_FRACTIONS[0];
  for (const f of CUP_FRACTIONS) if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
  if (best[0] === 1) { whole += 1; best = CUP_FRACTIONS[0]; }
  const num = whole > 0 ? (best[1] ? `${whole} ${best[1]}` : String(whole)) : best[1];
  return `${num} ${whole === 0 || (whole === 1 && !best[1]) ? 'cup' : 'cups'}`;
}
