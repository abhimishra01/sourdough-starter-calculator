import { computeFeed, peakText } from '../lib/starter.js';

// FAQ items. Rendered on the home page AND output as FAQPage JSON-LD.
// Answers are plain text (no HTML).
const feed = (amount, ratio) => computeFeed({ mode: 'keep', amount, ratio, hydration: 100, mix: { wheat: 0, rye: 0 } });
const f100 = feed(100, '1:5:5');
const jar = feed(20, '1:5:5');
const peak = (ratio) => peakText(feed(50, ratio).dilution, 75);

export const faq = [
  {
    q: 'How much should I feed my sourdough starter?',
    a: 'Feed by weight. Most bakers add equal parts flour and water, and use 1 to 10 times the weight of the starter they keep. A 1:1:1 feeding peaks fast. A 1:5:5 or 1:10:10 feeding peaks later and suits a once-a-day schedule. Pick the ratio that matches how often you can feed.',
  },
  {
    q: 'What does a 1:5:5 starter feeding mean?',
    a: `It means 1 part starter, 5 parts flour and 5 parts water, all by weight. If you keep 20 g of starter, you add ${jar.flour.total} g of flour and ${jar.water} g of water. The jar then holds ${jar.total} g.`,
  },
  {
    q: 'How often should I feed my starter?',
    a: 'On the counter, feed once or twice a day. A starter in the fridge needs a feeding about once a week. Before you bake, take it out and feed it once or twice at room temperature until it rises well.',
  },
  {
    q: 'How much starter do I discard before feeding?',
    a: 'Keep only the amount you enter under Starter I keep (grams) and discard the rest. Type the weight of your jar into Starter in my jar now, and the Discard card tells you the exact amount. You can bake with the discard, for example in pancakes or crackers. A small amount of starter in a large feed gives the longest wait before the peak.',
  },
  {
    q: 'Can I measure starter, flour and water in cups?',
    a: 'You can, and the calculator has a cups view. It is a guess, because a cup of flour can weigh anywhere from 100 to 150 g depending on how you scoop it. A kitchen scale gives the same result every time and costs very little.',
  },
  {
    q: 'How does hydration change a feeding?',
    a: 'Hydration is the weight of water as a percent of the weight of flour. At 100%, you add equal flour and water. At 80%, you add less water and more flour for the same total feed. The starter feels thicker and often ferments a little slower.',
  },
  {
    q: 'How long until my starter peaks after feeding?',
    a: `It depends on the feeding ratio and the temperature. In a 75 °F kitchen, a 1:1:1 feeding peaks in ${peak('1:1:1')} and a 1:5:5 feeding in ${peak('1:5:5')}. Look for a domed top, many bubbles and a level that has doubled. The estimate on this page is a guide only.`,
  },
  {
    q: 'How much do I feed 100 g of starter?',
    a: `At 1:5:5, keep 100 g of starter and add ${f100.flour.total} g of flour and ${f100.water} g of water. The jar then holds ${f100.total} g. For a smaller feeding, use 1:1:1 and add 100 g of each.`,
  },
  {
    q: 'How do I wake a starter from the fridge?',
    a: 'Take it out and let it warm up for an hour. Discard most of it, keep a small amount, and feed it at 1:2:2 or 1:5:5. Repeat once or twice a day until it doubles within 4 to 8 hours. Then it is ready to bake with.',
  },
  {
    q: 'My starter is runny or very thick. What should I change?',
    a: 'A runny starter often has too much water. Lower the hydration to 80% and feed it again. A very thick starter is stiff and slow. Raise the hydration to 100% and stir well. Change one thing at a time and watch the jar for a few feedings.',
  },
  {
    q: 'What if my starter does not peak or rise?',
    a: 'Check the kitchen first. Below 68 °F a starter is slow, so move the jar somewhere warmer. Then feed it more often with a smaller amount of old starter, for example 1:1:1 twice a day. Use unchlorinated water and a flour with some whole grain in it. Most weak starters recover in a few days.',
  },
];
