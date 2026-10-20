import assert from 'node:assert/strict';
import { computeFeed, roundToSum, peakTime, formatHours, gramsToCups, fToC, cToF } from '../src/lib/starter.js';

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
console.log(`${n} tests passed`);
