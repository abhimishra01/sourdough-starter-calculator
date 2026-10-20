// Core logic for the starter feeding calculator. Plain JS so node can test it without a build.

export const PRESETS = { '1:1:1': 1, '1:2:2': 2, '1:5:5': 5, '1:10:10': 10 };

// Rough grams per US cup. Cups vary a lot with how you scoop, so the page says grams are better.
export const GRAMS_PER_CUP = { starter: 227, white: 120, wheat: 113, rye: 102, water: 237 };

const HYDRATION_MIN = 40;
const HYDRATION_MAX = 150;

/**
 * Work out the parts of one feeding.
 * opts.mode: 'keep' (grams of starter you keep) or 'total' (grams of starter you want in all)
 * opts.ratio: a key of PRESETS or 'custom'
 * opts.custom: { s, f, w } parts of starter, flour, water (used when ratio is 'custom')
 * opts.hydration: percent water to flour in the feed (presets only)
 * opts.mix: { wheat, rye } percent of the flour that is whole wheat or rye
 */
export function computeFeed(opts) {
  const amount = Number(opts.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount above 0 grams.' };
  if (amount > 100000) return { ok: false, error: 'That amount is too large. Try 100,000 g or less.' };

  const wheatPct = Number(opts.mix?.wheat ?? 0);
  const ryePct = Number(opts.mix?.rye ?? 0);
  if (![wheatPct, ryePct].every(Number.isFinite) || wheatPct < 0 || ryePct < 0) {
    return { ok: false, error: 'Flour mix percentages must be 0 or more.' };
  }
  if (wheatPct + ryePct > 100.0001) {
    return { ok: false, error: 'Whole wheat and rye add up to more than 100%.' };
  }

  let sp, fp, wp, hydration;
  if (opts.ratio === 'custom') {
    sp = Number(opts.custom?.s);
    fp = Number(opts.custom?.f);
    wp = Number(opts.custom?.w);
    if (![sp, fp, wp].every(Number.isFinite) || sp <= 0 || fp <= 0 || wp < 0) {
      return { ok: false, error: 'Enter parts above 0 for starter and flour, and 0 or more for water.' };
    }
    if (sp + fp + wp > 5000) return { ok: false, error: 'Those ratio numbers are too large.' };
    hydration = (wp / fp) * 100;
  } else {
    const r = PRESETS[opts.ratio];
    if (!r) return { ok: false, error: 'Pick a feeding ratio.' };
    const h = Number(opts.hydration);
    if (!Number.isFinite(h) || h < HYDRATION_MIN || h > HYDRATION_MAX) {
      return { ok: false, error: `Hydration must be between ${HYDRATION_MIN}% and ${HYDRATION_MAX}%.` };
    }
    hydration = h;
    const feed = 2 * r; // parts of flour plus water per 1 part of starter
    sp = 1;
    fp = feed / (1 + h / 100);
    wp = feed - fp;
  }

  const sumParts = sp + fp + wp;
  const scale = opts.mode === 'total' ? amount / sumParts : amount / sp;
  const whiteShare = 1 - (wheatPct + ryePct) / 100;
  const raw = [
    sp * scale,
    fp * scale * whiteShare,
    fp * scale * (wheatPct / 100),
    fp * scale * (ryePct / 100),
    wp * scale,
  ];

  let r;
  if (opts.mode === 'total') {
    r = roundToSum(raw, Math.round(amount));
  } else {
    r = raw.map((v) => Math.round(v));
    r[0] = Math.round(amount);
  }
  const [starter, white, wheat, rye, water] = r;
  const flourTotal = white + wheat + rye;
  return {
    ok: true,
    starter,
    flour: { white, wheat, rye, total: flourTotal },
    water,
    total: starter + flourTotal + water,
    hydration,
    dilution: sumParts / sp, // how many times the starter is diluted by the feeding
    ratioLabel: opts.ratio === 'custom'
      ? `${trim(sp)}:${trim(fp)}:${trim(wp)}`
      : opts.ratio,
    wholeGrainShare: wheatPct + ryePct,
  };
}

function trim(n) {
  return String(Math.round(n * 100) / 100);
}

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

/**
 * Rough peak time in hours for a starter fed at a given dilution and kitchen temperature (Celsius).
 * Anchors at 77 F (25 C): 1:1:1 about 4 h, 1:2:2 about 6 h, 1:5:5 about 9 h, 1:10:10 about 12 h.
 * Every 10 C warmer halves the time. This is a guide only.
 */
export function peakTime(dilution, tempC) {
  if (!Number.isFinite(dilution) || !Number.isFinite(tempC)) return { ok: false };
  const base = Math.max(1.5, 4 + 4.1 * Math.log(Math.max(dilution, 1) / 3));
  const t = Math.min(35, Math.max(15, tempC));
  const mid = base * Math.pow(2, (25 - t) / 10);
  return {
    ok: true,
    mid,
    low: mid * 0.8,
    high: mid * 1.2,
    cold: tempC < 15,
    hot: tempC > 35,
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
  return `about ${f(a)} to ${f(b)} hours`;
}

export const fToC = (f) => ((f - 32) * 5) / 9;
export const cToF = (c) => (c * 9) / 5 + 32;

const EIGHTHS = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];

/** Grams to a kitchen measure, such as "1 ½ cups" or "3 tbsp". */
export function gramsToCups(grams, kind) {
  const per = GRAMS_PER_CUP[kind];
  if (!per || !(grams > 0)) return '0 cups';
  const cups = grams / per;
  if (cups < 0.25) {
    const tbsp = Math.max(0.5, Math.round(cups * 16 * 2) / 2);
    const w = Math.floor(tbsp);
    return `${w > 0 ? w : ''}${tbsp % 1 ? (w > 0 ? ' ' : '') + '\u00BD' : ''} tbsp`;
  }
  let eighths = Math.round(cups * 8);
  const whole = Math.floor(eighths / 8);
  const part = EIGHTHS[eighths % 8];
  const num = whole > 0 ? (part ? `${whole} ${part}` : String(whole)) : part;
  return `${num} ${eighths <= 8 ? 'cup' : 'cups'}`;
}
