import assert from 'node:assert/strict';
import { computeFeed, roundToSum, peakTime, formatHours, gramsToCups, fToC, cToF, nextAmount, feedNote, ratioHint, peakNote, peakText, jarLine, parseClock, formatClock, peakClock, feedClock, waitHours, suggestRatio, clockText, gramsToOz, RATIO_KEYS } from '../src/lib/starter.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const base = { mode: 'keep', amount: 50, ratio: '1:5:5', hydration: 100, mix: { wheat: 0, rye: 0 } };

t('keep 50 g at 1:5:5', () => {
  const r = computeFeed(base);
  assert.equal(r.starter, 50); assert.equal(r.flour.total, 250); assert.equal(r.water, 250); assert.equal(r.total, 550);
});
t('keep 20 g at 1:1:1', () => {
  const r = computeFeed({ ...base, amount: 20, ratio: '1:1:1' });
  assert.deepEqual([r.starter, r.flour.total, r.water, r.total], [20, 20, 20, 60]);
});
t('keep 10 g at 1:10:10', () => {
  const r = computeFeed({ ...base, amount: 10, ratio: '1:10:10' });
  assert.deepEqual([r.starter, r.flour.total, r.water], [10, 100, 100]);
});
t('total 300 g at 1:2:2 gives 60/120/120', () => {
  const r = computeFeed({ ...base, mode: 'total', amount: 300, ratio: '1:2:2' });
  assert.deepEqual([r.starter, r.flour.total, r.water, r.total], [60, 120, 120, 300]);
});
t('total 100 g at 1:1:1 keeps the sum at 100', () => {
  const r = computeFeed({ ...base, mode: 'total', amount: 100, ratio: '1:1:1' });
  assert.equal(r.total, 100);
  assert.equal(r.starter + r.flour.total + r.water, 100);
});
t('hydration 80% keeps feed weight, cuts water', () => {
  const r = computeFeed({ ...base, amount: 50, ratio: '1:2:2', hydration: 80 });
  // feed weight 200 g: flour 200/1.8 = 111.1, water 88.9
  assert.equal(r.flour.total, 111); assert.equal(r.water, 89);
});
t('hydration 100% means equal flour and water', () => {
  const r = computeFeed({ ...base, amount: 40, ratio: '1:5:5', hydration: 100 });
  assert.equal(r.flour.total, r.water);
});
t('final hydration matches the setting (starter at same hydration)', () => {
  const h = 0.8; const r = computeFeed({ ...base, amount: 90, ratio: '1:2:2', hydration: 80 });
  const starterFlour = r.starter / (1 + h); const starterWater = r.starter - starterFlour;
  const hyd = (r.water + starterWater) / (r.flour.total + starterFlour);
  assert.ok(Math.abs(hyd - h) < 0.01, String(hyd));
});
t('custom ratio 1:3:2 keep 30 g', () => {
  const r = computeFeed({ ...base, amount: 30, ratio: 'custom', custom: { s: 1, f: 3, w: 2 } });
  assert.deepEqual([r.starter, r.flour.total, r.water], [30, 90, 60]);
  assert.ok(Math.abs(r.hydration - 66.667) < 0.01); assert.equal(r.ratioLabel, '1:3:2');
});
t('custom ratio total mode 2:1:1 for 400 g', () => {
  const r = computeFeed({ ...base, mode: 'total', amount: 400, ratio: 'custom', custom: { s: 2, f: 1, w: 1 } });
  assert.deepEqual([r.starter, r.flour.total, r.water], [200, 100, 100]);
});
t('flour mix 80 white 20 whole wheat', () => {
  const r = computeFeed({ ...base, amount: 50, mix: { wheat: 20, rye: 0 } });
  assert.deepEqual([r.flour.white, r.flour.wheat, r.flour.rye, r.flour.total], [200, 50, 0, 250]);
});
t('flour mix with rye and wheat sums to flour total', () => {
  const r = computeFeed({ mode: 'total', amount: 333, ratio: '1:2:2', hydration: 100, mix: { wheat: 25, rye: 15 } });
  assert.equal(r.flour.white + r.flour.wheat + r.flour.rye, r.flour.total);
  assert.equal(r.total, 333);
});
t('rejects bad input', () => {
  assert.equal(computeFeed({ ...base, amount: 0 }).ok, false);
  assert.equal(computeFeed({ ...base, amount: -5 }).ok, false);
  assert.equal(computeFeed({ ...base, amount: NaN }).ok, false);
  assert.equal(computeFeed({ ...base, hydration: 10 }).ok, false);
  assert.equal(computeFeed({ ...base, mix: { wheat: 70, rye: 40 } }).ok, false);
  assert.equal(computeFeed({ ...base, ratio: 'custom', custom: { s: 0, f: 1, w: 1 } }).ok, false);
});
t('roundToSum', () => {
  assert.deepEqual(roundToSum([33.3, 33.3, 33.4], 100), [33, 33, 34]);
  assert.equal(roundToSum([0.5, 0.5, 0.5, 0.5], 2).reduce((a, b) => a + b), 2);
});
t('peak time anchors at 77 F', () => {
  const c = fToC(77);
  const near = (d, h) => assert.ok(Math.abs(peakTime(d, c).mid - h) < 0.5, `${d} -> ${peakTime(d, c).mid}`);
  near(3, 4); near(5, 6); near(11, 9); near(21, 12);
});
t('peak time: cooler is slower, warmer is faster', () => {
  const cool = peakTime(11, fToC(68)).mid, warm = peakTime(11, fToC(82)).mid, mid = peakTime(11, fToC(77)).mid;
  assert.ok(cool > mid && mid > warm);
  assert.ok(Math.abs(peakTime(11, 15).mid / peakTime(11, 25).mid - 2 ** 1) < 1e-9);
});
t('peak time flags extremes', () => {
  assert.equal(peakTime(11, 10).cold, true); assert.equal(peakTime(11, 40).hot, true); assert.equal(peakTime(11, 25).cold, false);
});
t('formatHours', () => {
  assert.equal(formatHours(5.1, 6.9), 'about 5 to 7 hours');
  assert.equal(formatHours(8.4, 12.6), 'about 8 to 13 hours');
  assert.equal(formatHours(3.1, 3.2), 'about 3 hours');
  assert.equal(formatHours(3.8, 5.2), 'about 4 to 5 hours');
  assert.equal(formatHours(20, 30), 'about a day or more');
});
t('temperature conversion', () => {
  assert.equal(Math.round(fToC(77)), 25); assert.equal(Math.round(cToF(20)), 68); assert.equal(Math.round(fToC(32)), 0);
});
t('cups', () => {
  assert.equal(gramsToCups(3, 'white'), '\u00BD tbsp');
  assert.equal(gramsToCups(120, 'white'), '1 cup');
  assert.equal(gramsToCups(180, 'white'), '1 ½ cups');
  assert.equal(gramsToCups(237, 'water'), '1 cup');
  assert.equal(gramsToCups(60, 'white'), '½ cup');
  assert.equal(gramsToCups(15, 'white'), '2 tbsp');
  assert.equal(gramsToCups(50, 'starter'), '3 \u00BD tbsp');
  assert.equal(gramsToCups(57, 'starter'), '¼ cup');
});

t('rejects amounts under 1 g and names the field', () => {
  for (const mode of ['keep', 'total']) {
    const r = computeFeed({ ...base, mode, amount: 0.4 });
    assert.equal(r.ok, false); assert.equal(r.field, 'amount');
  }
  assert.equal(computeFeed({ ...base, amount: 1 }).ok, true);
});
t('total mode rejects a total too small to split', () => {
  assert.equal(computeFeed({ ...base, mode: 'total', amount: 1, ratio: '1:10:10' }).ok, false);
  assert.equal(computeFeed({ ...base, mode: 'total', amount: 2, ratio: '1:1:1', mix: { wheat: 20, rye: 0 } }).ok, false);
});
t('custom ratio: tiny or lopsided parts are refused, no NaN or Infinity', () => {
  const c = (s, f, w, amount = 50, mode = 'keep') => computeFeed({ ...base, mode, amount, ratio: 'custom', custom: { s, f, w } });
  assert.equal(c(0.000000001, 1, 1).ok, false);
  assert.equal(c(1e-320, 1, 1).ok, false);
  assert.equal(c(0.001, 4999, 0, 100000).ok, false);
  assert.equal(c(1, 2000, 1).ok, false);
  assert.equal(c(1, 4, 4).ok, true);
  assert.equal(c(0.01, 5, 5, 100000).ok, false); assert.equal(c(0.01, 5, 5, 1000).ok, true);
});
t('keep mode rounds the typed amount to whole grams', () => {
  const r = computeFeed({ ...base, amount: 12.4, ratio: '1:1:1' });
  assert.deepEqual([r.starter, r.flour.total, r.water], [12, 12, 12]);
});
t('wheat + rye just over 100 does not give -0', () => {
  const r = computeFeed({ ...base, mix: { wheat: 70, rye: 30.00005 } });
  assert.equal(Object.is(r.flour.white, -0), false);
});
t('total mode at 100% hydration: parts differ by at most 1 g and add up', () => {
  const r = computeFeed({ ...base, mode: 'total', amount: 120, ratio: '1:5:5' });
  assert.equal(r.total, 120); assert.ok(Math.abs(r.flour.total - r.water) <= 1);
});
t('stepper never moves the wrong way and stays at 1 or more', () => {
  for (const cur of [NaN, 0, 0.5, 1, 3, 5, 12, 49, 50, 190, 200, 250]) {
    assert.ok(nextAmount(cur, 'up') > (Number.isFinite(cur) ? cur : 0), `up ${cur}`);
    assert.ok(nextAmount(cur, 'down') >= 1, `down ${cur}`);
    assert.ok(nextAmount(cur, 'down') <= Math.max(1, Number.isFinite(cur) ? cur : 0), `down ${cur}`);
  }
  assert.equal(nextAmount(3, 'down'), 1); assert.equal(nextAmount(200, 'down'), 190); assert.equal(nextAmount(190, 'up'), 200);
});
t('cups use fractions a measuring cup has', () => {
  assert.equal(gramsToCups(29, 'white'), '4 tbsp');
  assert.equal(gramsToCups(105, 'white'), '¾ cup');
  assert.equal(gramsToCups(200, 'white'), '1 ⅔ cups');
  assert.equal(gramsToCups(40, 'white'), '⅓ cup');
  assert.equal(gramsToCups(237, 'water'), '1 cup');
  assert.equal(gramsToCups(240, 'white'), '2 cups');
  for (let g = 30; g < 1500; g += 7) assert.ok(!/[⅛⅜⅝⅞]/.test(gramsToCups(g, 'white')), String(g));
});
t('formatHours uses singular for one hour or less', () => {
  assert.equal(formatHours(0.5, 1), 'about 0.5 to 1 hour');
});
t('hint text matches the numbers when hydration is not 100%', () => {
  const r = computeFeed({ ...base, amount: 50, ratio: '1:5:5', hydration: 80 });
  assert.match(ratioHint(r), /sets the feed size: 10 parts/);
  assert.match(ratioHint(r), /5\.6 parts flour and 4\.4 parts water/);
  assert.match(feedNote(r), /Feed size 1:5:5 at 80% hydration/);
  const c = computeFeed({ ...base, ratio: 'custom', custom: { s: 1, f: 1, w: 3 } });
  assert.match(ratioHint(c), /1 part starter, 1 part flour and 3 parts water/);
  assert.match(feedNote(computeFeed(base)), /^Keep 50 g of starter in the jar/);
});
t('peak text and note: one source of truth for the thresholds', () => {
  assert.equal(peakText(11, 75), 'about 8 to 12 hours');
  assert.equal(peakText(11, 75, { bare: true }), '8 to 12 hours');
  assert.match(peakNote(peakTime(11, fToC(50)), 50, 'F', 0), /^Below 59 °F \(15 °C\)/);
  assert.match(peakNote(peakTime(11, fToC(100)), 100, 'F', 0), /^Above 95 °F \(35 °C\)/);
  assert.match(peakNote(peakTime(11, 24), 24, 'C', 40), /Whole grain/);
});

t('jar: discard, keep and add line', () => {
  const r = computeFeed({ ...base, amount: 20, jar: 300 });
  assert.equal(r.discard, 280); assert.equal(r.short, 0);
  assert.equal(jarLine(r), 'Keep 20 g. Discard 280 g. Add 100 g flour and 100 g water. Total 220 g.');
});
t('jar: short jar and exact jar', () => {
  const s = computeFeed({ ...base, amount: 50, jar: 30 });
  assert.equal(s.short, 20); assert.equal(s.discard, 0); assert.match(jarLine(s), /20 g short/);
  const e = computeFeed({ ...base, amount: 50, jar: 50 });
  assert.match(jarLine(e), /Discard nothing/);
});
t('jar: empty means not given, bad values are refused', () => {
  for (const j of ['', undefined, null, NaN]) assert.equal(computeFeed({ ...base, jar: j }).jar, null);
  assert.equal(jarLine(computeFeed(base)), null);
  const bad = computeFeed({ ...base, jar: -5 });
  assert.equal(bad.ok, false); assert.equal(bad.field, 'jar');
  assert.equal(computeFeed({ ...base, jar: 0 }).short, 50);
});
t('1:3:3 and 1:4:4 presets', () => {
  assert.ok(RATIO_KEYS.includes('1:3:3') && RATIO_KEYS.includes('1:4:4'));
  const r = computeFeed({ ...base, amount: 20, ratio: '1:3:3' });
  assert.deepEqual([r.flour.total, r.water], [60, 60]);
});
t('clock helpers', () => {
  assert.equal(parseClock('21:30'), 1290); assert.ok(Number.isNaN(parseClock('')));
  assert.ok(Number.isNaN(parseClock('25:00')));
  assert.equal(formatClock(0), '12 am'); assert.equal(formatClock(12 * 60 + 15), '12:15 pm'); assert.equal(formatClock(21.5 * 60), '9:30 pm');
  assert.equal(formatClock(26 * 60), '2 am'); assert.equal(formatClock(-60), '11 pm');
  assert.equal(peakClock(21.5 * 60, 8, 10), '5:30 am to 7:30 am');
  assert.equal(feedClock(7 * 60, 8, 10), '9 pm to 11 pm');
  assert.equal(waitHours(21.5 * 60, 7 * 60), 9.5); assert.equal(waitHours(60, 60), 0);
});
t('clock text and ratio suggestion', () => {
  const pk = peakTime(11, fToC(75));
  const text = clockText({ pk, tC: fToC(75), fed: 21.5 * 60, ready: NaN, ratio: '1:5:5' });
  assert.match(text, /^Fed at 9:30 pm: peak around/);
  assert.equal(clockText({ pk: peakTime(11, fToC(40)), tC: fToC(40), fed: 0, ready: 0, ratio: '1:5:5' }), '');
  assert.equal(clockText({ pk, tC: fToC(75), fed: NaN, ready: NaN, ratio: '1:5:5' }), '');
  assert.equal(suggestRatio(4, fToC(77)).key, '1:1:1');
  assert.equal(suggestRatio(12, fToC(77)).key, '1:10:10');
  assert.equal(suggestRatio(5, fToC(10)), null);
});
t('ounces', () => { assert.equal(gramsToOz(250), '8.8 oz'); assert.equal(gramsToOz(28.3495), '1 oz'); });

console.log(`${n} tests passed`);