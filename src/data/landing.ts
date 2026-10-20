import { computeFeed, peakText, peakTime, fToC, formatClock, peakClock, formatHours } from '../lib/starter.js';

// Landing pages for specific searches. Every number comes from the same code as the calculator,
// so a page can never disagree with the tool. Text is written by hand for each case.

type Table = { caption: string; head: string[]; rows: string[][] };
type Section = { h: string; p: string[] };
export type Landing = {
  slug: string;
  title: string; // shown before " | Starter Feeding Calculator"
  h1: string;
  description: string;
  lead: string; // the answer, first sentence of the page
  preset: Record<string, unknown>;
  table: Table;
  sections: Section[];
  qa: { q: string; a: string }[];
  linkText: string; // short label for the home page list
};

const feed = (amount: number, ratio: string, mode = 'keep', extra: Record<string, unknown> = {}) =>
  computeFeed({ mode, amount, ratio, hydration: 100, mix: { wheat: 0, rye: 0 }, ...extra }) as any;
const g = (n: number) => `${n.toLocaleString('en-US')} g`;
const pk = (ratio: string, f: number) => peakText(feed(50, ratio).dilution, f, { bare: true });

// Table: one ratio, several starter amounts.
const byAmount = (ratio: string, amounts: number[]): Table => ({
  caption: `Flour and water to add for common starter amounts at ${ratio}`,
  head: ['Starter you keep', 'Flour', 'Water', 'Jar total'],
  rows: amounts.map((a) => { const r = feed(a, ratio); return [g(a), g(r.flour.total), g(r.water), g(r.total)]; }),
});

// Table: one starter amount, every ratio.
const byRatio = (amount: number): Table => ({
  caption: `Flour and water to add to ${amount} g of starter at each ratio`,
  head: ['Ratio', 'Flour', 'Water', 'Jar total', 'Peak at 75 °F'],
  rows: ['1:1:1', '1:2:2', '1:3:3', '1:4:4', '1:5:5', '1:10:10'].map((k) => {
    const r = feed(amount, k);
    return [k, g(r.flour.total), g(r.water), g(r.total), pk(k, 75)];
  }),
});

const peakByTemp = (): Table => ({
  caption: 'Rough peak time by feeding ratio and kitchen temperature',
  head: ['Ratio', '65 °F', '70 °F', '75 °F', '80 °F', '85 °F'],
  rows: ['1:1:1', '1:2:2', '1:3:3', '1:5:5', '1:10:10'].map((k) => [k, ...[65, 70, 75, 80, 85].map((f) => pk(k, f))]),
});

const discardTable = (): Table => ({
  caption: 'How much to discard from a full jar when you keep 20 g or 50 g',
  head: ['Starter in the jar', 'Keep 20 g: discard', 'Keep 50 g: discard'],
  rows: [100, 200, 300, 500].map((j) => [g(j), g(j - 20), g(j - 50)]),
});

const overnightTable = (): Table => {
  const fed = 21.5 * 60;
  return {
    caption: 'Fed at 9:30 pm: when the starter peaks, by ratio and kitchen temperature',
    head: ['Ratio', 'At 68 °F', 'At 75 °F'],
    rows: ['1:2:2', '1:3:3', '1:5:5', '1:10:10'].map((k) => {
      const d = feed(50, k).dilution;
      const at = (f: number) => { const p = peakTime(d, fToC(f)); return peakClock(fed, p.low, p.high); };
      return [k, at(68), at(75)];
    }),
  };
};

const levainTable = (): Table => ({
  caption: 'Starter, flour and water for a levain of a set weight at 1:5:5',
  head: ['Recipe needs', 'Starter', 'Flour', 'Water'],
  rows: [80, 120, 160, 200, 300].map((t) => { const r = feed(t, '1:5:5', 'total'); return [g(t), g(r.starter), g(r.flour.total), g(r.water)]; }),
});

const ratioPage = (ratio: string, o: { slug: string; word: string; use: string; why: string; mistake: string; fits: string }): Landing => {
  const k = ratio.split(':')[1];
  const r = feed(50, ratio);
  const r20 = feed(20, ratio);
  return {
    slug: o.slug,
    title: `${ratio} Sourdough Starter Feeding Calculator`,
    h1: `${ratio} sourdough starter feeding calculator`,
    description: `A ${ratio} feeding is ${k} parts flour and ${k} parts water for each part of starter. See the grams for 20 g to 200 g of starter and the peak time.`,
    lead: `A ${ratio} feeding means 1 part starter, ${k} ${k === '1' ? 'part' : 'parts'} flour and ${k} ${k === '1' ? 'part' : 'parts'} water, all by weight. To keep 50 g of starter, add ${g(r.flour.total)} of flour and ${g(r.water)} of water. The jar then holds ${g(r.total)}.`,
    preset: { mode: 'keep', amount: 50, ratio },
    table: byAmount(ratio, [10, 20, 50, 100, 200]),
    sections: [
      { h: `When to use ${ratio}`, p: [o.use, o.fits] },
      { h: `How long a ${ratio} feeding takes to peak`, p: [
        `At 75 °F, a ${ratio} feeding usually peaks in ${pk(ratio, 75)}. In a cool 68 °F kitchen, expect ${pk(ratio, 68)}. In a warm 82 °F kitchen, expect ${pk(ratio, 82)}. These are guides for an active starter at 100% hydration fed with white flour.`,
        o.why,
      ] },
      { h: 'A common mistake', p: [o.mistake] },
    ],
    qa: [
      { q: `How much flour and water do I add for ${ratio} with 20 g of starter?`, a: `Add ${g(r20.flour.total)} of flour and ${g(r20.water)} of water to 20 g of starter. The jar holds ${g(r20.total)} after the feeding.` },
      { q: `Is ${ratio} the right ratio for me?`, a: o.word },
    ],
    linkText: `${ratio} feeding`,
  };
};

export const landing: Landing[] = [
  ratioPage('1:1:1', {
    slug: '1-1-1-feeding-ratio',
    use: 'Use 1:1:1 when you want a starter that is ready soon. It is the usual choice to wake a starter from the fridge, to rescue a weak one, or to build starter for a bake the same day.',
    fits: 'It also suits bakers who feed twice a day. The starter gets fresh food often, so it stays active and tends to taste more tangy.',
    why: 'A small feeding spreads the yeast only a little, so the food runs out quickly. That is why the peak comes early and the starter can fall back before you notice.',
    mistake: 'Many bakers use 1:1:1 and then feed once a day. The starter peaks in the afternoon, falls, and sits hungry for hours. If you feed once a day, use 1:5:5 instead, or feed more often.',
    word: 'It is right if you can feed every 4 to 8 hours or want a quick wake-up. If you feed once a day, a larger ratio such as 1:5:5 fits better.',
  }),
  ratioPage('1:2:2', {
    slug: '1-2-2-feeding-ratio',
    use: 'Use 1:2:2 for a steady routine. It is a good middle path for a starter that lives on the counter and gets two feedings a day.',
    fits: 'It also works when you need a bit more starter than you keep. Feeding 40 g of starter gives 200 g in the jar, enough for most loaves.',
    why: 'The feeding dilutes the starter about five times, so the peak comes later than with 1:1:1 but earlier than with 1:5:5. That gives a gap of about half a day between feedings.',
    mistake: 'Some bakers switch ratios every day, then wonder why the starter is unpredictable. Pick one ratio for a week and note when the jar peaks. Change the ratio only if that time does not suit you.',
    word: 'It is right for a morning and evening routine. If your day has one long gap, use a larger ratio so the peak lands near your next feeding.',
  }),
  ratioPage('1:5:5', {
    slug: '1-5-5-feeding-ratio',
    use: 'Use 1:5:5 for one feeding a day. A small amount of starter goes into a lot of fresh flour and water, so the jar takes most of a day to peak.',
    fits: 'It also fits bakers who like a milder, less sour starter. Feed in the morning and the starter is ready to use that evening, or feed at night and use it the next morning.',
    why: 'The feeding dilutes the starter eleven times. Yeast needs time to grow back, which is why the peak is many hours away. A cool kitchen can stretch it to a full day.',
    mistake: 'A 1:5:5 feeding needs a lot of flour and water for a large jar. If you keep 100 g of starter, the jar holds 1,100 g. Keep less starter in the jar and you waste less flour.',
    word: 'It is right if you feed once a day and want a mild starter. If your kitchen is very warm, step up to 1:10:10 so the peak does not come too early.',
  }),
  ratioPage('1:10:10', {
    slug: '1-10-10-feeding-ratio',
    use: 'Use 1:10:10 when the starter must wait a long time. It is the usual choice for an overnight feeding, a work day away from home, or a hot kitchen.',
    fits: 'You keep very little starter. Keeping 10 g is enough, so you discard almost all of the jar and waste little. That makes it popular with bakers who feed every day.',
    why: 'The feeding dilutes the starter twenty-one times, so the peak is far off. In a warm kitchen it can still come in about half a day. In a cool one it can take a full day or more.',
    mistake: 'With only a few grams of starter, small scale errors matter. If you keep 10 g and weigh 12 g, the feeding is 20% off. Tare the jar and add the starter slowly.',
    word: 'It is right if the starter must last 12 hours or more. If you want it ready in a few hours, use a smaller ratio.',
  }),
  {
    slug: 'feed-50g-starter',
    title: 'How Much to Feed 50 g of Sourdough Starter',
    h1: 'How much to feed 50 g of sourdough starter',
    description: 'Flour and water to add to 50 g of sourdough starter at 1:1:1, 1:2:2, 1:5:5 and 1:10:10, with the jar total and a rough peak time for each.',
    lead: `To feed 50 g of starter at 1:1:1, add 50 g of flour and 50 g of water. At 1:5:5, add ${g(feed(50, '1:5:5').flour.total)} of flour and ${g(feed(50, '1:5:5').water)} of water. The table shows every common ratio.`,
    preset: { mode: 'keep', amount: 50, ratio: '1:5:5' },
    table: byRatio(50),
    sections: [
      { h: 'Why 50 g is a handy amount', p: [
        'Fifty grams fits a small jar and gives enough starter for one loaf. At 1:2:2 the jar holds 250 g, which is more than most recipes ask for. At 1:1:1 it holds 150 g, enough to bake a small loaf or two.',
        'If you have more than 50 g in the jar, discard the extra before you feed. Use the box named Starter in my jar now to see the exact amount.',
      ] },
      { h: 'Choosing a ratio for 50 g', p: [
        'Pick the ratio that matches when you will be back. A 1:1:1 feeding peaks in about 4 hours at 77 °F. A 1:10:10 feeding peaks in about 12 hours. The peak column in the table uses 75 °F. Your kitchen will move it.',
        'A larger ratio costs more flour. At 1:10:10, 50 g of starter needs 500 g of flour. If that is too much, keep a smaller amount of starter instead, for example 10 g.',
      ] },
    ],
    qa: [
      { q: 'How much flour and water do I add to 50 g of starter?', a: `It depends on the ratio. At 1:1:1 add 50 g of each. At 1:2:2 add 100 g of each. At 1:5:5 add ${g(feed(50, '1:5:5').flour.total)} of each. Use the table above for every ratio.` },
      { q: 'Should the flour and water weigh the same?', a: 'At 100% hydration, yes. Equal weights of flour and water give a starter that pours slowly. For a stiffer starter, lower the hydration in the calculator.' },
    ],
    linkText: 'Feed 50 g of starter',
  },
  {
    slug: 'feed-100g-starter',
    title: 'How Much to Feed 100 g of Sourdough Starter',
    h1: 'How much to feed 100 g of sourdough starter',
    description: 'Flour and water to add to 100 g of sourdough starter at each common ratio, with the jar total and a rough peak time.',
    lead: `To feed 100 g of starter at 1:1:1, add 100 g of flour and 100 g of water. At 1:2:2, add 200 g of each. At 1:5:5, add ${g(feed(100, '1:5:5').flour.total)} of each, and the jar holds ${g(feed(100, '1:5:5').total)}.`,
    preset: { mode: 'keep', amount: 100, ratio: '1:2:2' },
    table: byRatio(100),
    sections: [
      { h: 'When 100 g makes sense', p: [
        'A 100 g starter suits bakers who make several loaves or feed a big family. It also holds steady better than a very small starter, because one gram off on the scale matters less.',
        'It uses a lot of flour at the larger ratios. If you only bake once a week, you may do better to keep 20 g in the jar and build up before the bake.',
      ] },
      { h: 'Use the discard', p: [
        'Most days you will discard part of the jar before you feed. Do not throw it out yet. Discard works in pancakes, crackers, flatbreads and waffles. Keep a covered container in the fridge and add to it each day.',
        'If the jar holds more than 100 g, type its weight into Starter in my jar now. The calculator tells you how much to remove.',
      ] },
      { h: 'Check the jar size', p: [
        'At 1:5:5 the feeding reaches 1,100 g. That needs a jar of at least 2 liters, because the starter will double. At 1:2:2 the jar holds 500 g and a 1 liter jar is enough.',
      ] },
    ],
    qa: [
      { q: 'How much do I feed 100 g of starter?', a: `At 1:1:1, add 100 g of flour and 100 g of water. At 1:5:5, add ${g(feed(100, '1:5:5').flour.total)} of each.` },
      { q: 'What jar do I need for 100 g of starter?', a: 'For 1:1:1 or 1:2:2 a 1 liter jar is enough. For 1:5:5 use a jar of 2 liters or more, because the starter doubles in size.' },
    ],
    linkText: 'Feed 100 g of starter',
  },
  {
    slug: 'sourdough-discard-calculator',
    title: 'Sourdough Starter Discard Calculator',
    h1: 'Sourdough starter discard calculator',
    description: 'Type the weight of the starter in your jar and the amount you want to keep. See how much to discard and how much flour and water to add.',
    lead: `If your jar holds 300 g of starter and you want to keep 20 g, discard 280 g. At 1:5:5, add ${g(feed(20, '1:5:5').flour.total)} of flour and ${g(feed(20, '1:5:5').water)} of water. Type your own jar weight in the tool below.`,
    preset: { mode: 'keep', amount: 20, ratio: '1:5:5', jar: 300 },
    table: discardTable(),
    sections: [
      { h: 'How to weigh the jar', p: [
        'Put the empty jar on the scale and press tare. Add the starter, or weigh the jar full and subtract the empty jar. Enter the starter weight, not the jar weight.',
        'Spoon the extra starter into a second container. Weigh the jar again to check that only the amount you want to keep is left.',
      ] },
      { h: 'Why discard at all', p: [
        'Without discard, the jar would grow every day and need more flour. Discarding keeps the amount of flour small and the starter fresh. A feeding of 20 g of starter at 1:5:5 uses 200 g of flour and water in total. Without discarding, a 300 g jar would need 3,000 g of flour and water.',
        'If you do not want to waste flour, keep less starter in the jar. Ten or twenty grams is enough for many bakers.',
      ] },
      { h: 'What to do with discard', p: [
        'Cook with it the same day or keep it in the fridge. It makes good pancakes, waffles, crackers and flatbreads. It is fine to add fresh discard to a covered container for up to a week.',
      ] },
    ],
    qa: [
      { q: 'How much starter should I keep?', a: 'Keep as little as your routine allows. Many bakers keep 20 g to 50 g. A smaller amount means less discard and less flour, but a longer wait before the peak.' },
      { q: 'What if my jar holds less than the amount I want to keep?', a: 'Then you are short. The calculator shows how many grams are missing. Use a smaller amount to keep, or feed the jar once and wait for it to grow.' },
    ],
    linkText: 'Discard calculator',
  },
  {
    slug: 'feed-starter-at-night-peak-by-morning',
    title: 'Feed Starter at Night to Peak by Morning',
    h1: 'Feed your starter at night so it peaks by morning',
    description: 'Pick a ratio and the time you feed. See when your sourdough starter peaks, or enter the hour you want it ready and get a ratio that fits.',
    lead: `Feed at 9:30 pm at 1:3:3 in a 70 °F kitchen and the starter peaks around ${(() => { const p = peakTime(feed(50, '1:3:3').dilution, fToC(70)); return peakClock(21.5 * 60, p.low, p.high); })()}. The tool below does the same sum for your time, your ratio and your kitchen.`,
    preset: { mode: 'keep', amount: 20, ratio: '1:3:3', tempF: 70, fedAt: '21:30', readyBy: '07:00' },
    table: overnightTable(),
    sections: [
      { h: 'How the clock times work', p: [
        'Enter the time you feed in the box named I feed at. The tool adds the peak range for your ratio and temperature. Enter the time you want the starter ready in I want it ready by, and it shows when to feed.',
        'If you fill in both, the tool finds the ratio whose peak is closest to the hours you have. That is the answer to "which ratio should I use tonight".',
      ] },
      { h: 'Which ratio for a night feeding', p: [
        'A night feeding means 8 to 12 hours of waiting. In a 68 °F kitchen, 1:5:5 or 1:10:10 usually fits. In a warm 80 °F kitchen, 1:10:10 or even larger may fit better, because the starter ripens faster.',
        'If you feed at 11 pm and want to bake at 7 am, you have 8 hours. Check the table above, then adjust for your own kitchen after one trial night.',
      ] },
      { h: 'Check it in the morning', p: [
        'The times are a guide. Look at the jar. A ready starter has a domed top, many bubbles and about double its starting height. If it already fell, use a larger ratio next time. If it has not risen, use a smaller one or find a warmer spot.',
      ] },
    ],
    qa: [
      { q: 'What time should I feed my starter to bake at 7 am?', a: 'Enter 7:00 am in I want it ready by. The tool shows a feeding window for your ratio and temperature. For 1:5:5 at 70 °F, that window falls in the evening.' },
      { q: 'What if my starter peaks too early?', a: 'Use a larger ratio, such as 1:10:10, or keep the jar somewhere cooler. A smaller amount of starter in more flour takes longer to peak.' },
    ],
    linkText: 'Feed at night, peak by morning',
  },
  {
    slug: 'sourdough-starter-peak-time-calculator',
    title: 'Sourdough Starter Peak Time Calculator',
    h1: 'Sourdough starter peak time calculator',
    description: 'See a rough peak time for a sourdough starter by feeding ratio and kitchen temperature, from 65 °F to 85 °F. A guide, with a table you can print.',
    lead: `At 70 °F, a 1:1:1 feeding peaks in ${pk('1:1:1', 70)} and a 1:5:5 feeding in ${pk('1:5:5', 70)}. Warm the kitchen and the times get shorter. Set your own temperature in the tool below.`,
    preset: { mode: 'keep', amount: 50, ratio: '1:5:5', tempF: 70 },
    table: peakByTemp(),
    sections: [
      { h: 'What affects the peak time', p: [
        'Two things matter most: how much you dilute the starter and how warm the jar is. A larger ratio spreads the yeast thin, so it needs longer to grow back. Every 18 °F (10 °C) of extra warmth cuts the wait about in half.',
        'Flour matters too. Whole wheat and rye feed the yeast more, so the peak often comes sooner. A starter that is young, weak or recently out of the fridge is slower than a healthy one.',
      ] },
      { h: 'How to spot the peak', p: [
        'Mark the starting level with a rubber band. At the peak the starter has about doubled, the top is domed, and the surface is full of bubbles. A starter that has started to fall has a flat or dipped top and a stronger smell.',
        'Use the starter at or just after the peak. Feed again if you will not bake soon.',
      ] },
      { h: 'When the table does not apply', p: [
        'Below 59 °F or above 95 °F the tool shows no time, because a starter behaves in unpredictable ways there. Find a warmer or cooler spot. The oven with only the light on is a common warm place.',
      ] },
    ],
    qa: [
      { q: 'How long does it take a starter to peak at room temperature?', a: `At 75 °F, from ${pk('1:1:1', 75)} for a 1:1:1 feeding to ${pk('1:10:10', 75)} for a 1:10:10 feeding.` },
      { q: 'Is this peak time exact?', a: 'No. It is a rough guide for an active starter at 100% hydration. Watch the jar and learn how your own starter behaves.' },
    ],
    linkText: 'Peak time by temperature',
  },
  {
    slug: 'levain-calculator-for-recipe',
    title: 'Levain Calculator for a Bread Recipe',
    h1: 'Levain calculator: how much to feed for your recipe',
    description: 'A recipe asks for a set weight of levain or ripe starter. Enter it and get the grams of starter, flour and water to mix.',
    lead: `If your recipe needs 120 g of levain and you feed at 1:5:5, mix ${g(feed(120, '1:5:5', 'total').starter)} of starter with ${g(feed(120, '1:5:5', 'total').flour.total)} of flour and ${g(feed(120, '1:5:5', 'total').water)} of water. The tool below works for any weight.`,
    preset: { mode: 'total', amount: 120, ratio: '1:5:5' },
    table: levainTable(),
    sections: [
      { h: 'How this differs from a normal feeding', p: [
        'In a normal feeding you choose how much starter to keep. For a levain you choose how much you need in the end. The calculator works backward from your total and gives the starter, flour and water that add up to it.',
        'The amounts are rounded to whole grams and still add up to your total.',
      ] },
      { h: 'Timing the levain', p: [
        `Mix the levain a set number of hours before you mix the dough. At 75 °F, a 1:5:5 levain is ready in ${pk('1:5:5', 75)}. A 1:2:2 levain is ready in ${pk('1:2:2', 75)}. Use it when it has doubled and the top is domed.`,
        'Many recipes call for the levain at its peak. A levain that has fallen is more sour and less strong.',
      ] },
      { h: 'Build extra', p: [
        'Make a little more than the recipe needs, for example 10 g more. You lose some to the jar walls. The extra also becomes the starter you save for next time.',
      ] },
    ],
    qa: [
      { q: 'What is the difference between levain and starter?', a: 'A starter is the culture you keep alive. A levain is a portion you feed to build up for one bake. The math is the same.' },
      { q: 'Which ratio should I use for a levain?', a: 'Use 1:5:5 for an overnight levain and 1:2:2 for a few hours. Pick the one that peaks when you plan to mix the dough.' },
    ],
    linkText: 'Levain for a recipe',
  },
];
