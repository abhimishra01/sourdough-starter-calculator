# Mock-customer test: sourdough starter feeding calculator

Method: built to my own folder, served on port 4467, five personas used the live page in a real browser (playwright-cli) at their own viewport. Server stopped, temp folders deleted.

## Persona 1: Jenna, 29, nurse, beginner, iPhone (390x844)
Got a starter from a coworker. The recipe card says "feed 1:1:1". She googles "how much to feed sourdough starter".
She typed 30 g, tapped 1:1:1, then switched to cups because she has no scale. She got 2 tbsp starter, 1/4 cup flour, 2 tbsp water.
- Click on Google over the others? "Yes, if the snippet says grams and cups. The name says exactly what I want."
- Under 30 seconds? "About 25 seconds, but the answer sat below the screen. I had to scroll to see it. For a second I thought nothing happened."
- Confused me: "What is hydration? What is 'Starter I keep' vs 'Total I need'? 'Ripe starter' sounds like I need to know if mine is ripe. The line '1 parts flour' read like a typo."
- Missing to bookmark: "A plain 'what to do now' list: discard, add, stir, wait. Also what to do with the discard."
- Trust: "Mostly. The cups note says grams are better, so I will buy a scale. 2 tbsp is easy to measure, 7/8 cup is not."
- Come back: yes, if it remembers my 30 g (it does, I checked).

## Persona 2: Marcus, 41, dad, weekly baker, Android (375x667, small phone)
Needs 200 g of ripe starter for Saturday's loaf. He fed on Friday night.
He chose Total I need, typed 200, picked 1:2:2, opened Flour mix, chose 80% white / 20% whole wheat. Got 40 g starter, 64 g white, 16 g whole wheat, 80 g water. He tapped Copy amounts and it said Copied.
- Click on Google over the others? "Yes. The 'total I need' switch is the thing the other calculators do not have."
- Under 30 seconds? "About 40 seconds because of the flour mix, and I scrolled twice. The result is off the first screen."
- Confused me: "'Discard any extra starter first.' How much? I want it to say: keep 40 g, throw out the rest."
- Missing to bookmark: "A start time. I feed at 9 pm. Tell me when it peaks: 'ready about 5 to 8 am'. A time of day beats 'hours'."
- Trust: "Yes. The numbers add up and the total matches 200."
- Come back: "Yes, weekly. I would pin it to my home screen if the amounts were at the top."

## Persona 3: Dana, 34, remote worker, intermediate, laptop (1440x900)
Keeps 20 g in a jar, feeds 1:10:10 overnight at 68 F, hydration 80%.
She tapped 20 g, 1:10:10, typed 68, tapped 80%. She got 222 g flour and 178 g water. She switched to Celsius and the box changed to 20 C by itself. Peak: 14 to 20 hours.
- Click on Google over the others? "Yes. Clean, fast, no ads yet."
- Under 30 seconds? "Yes, about 20 seconds. Result and inputs fit on one screen on desktop."
- Confused me: "I picked 1:10:10 and got 222 and 178, not 200 and 200. The label still says 1:10:10. I had to read the article to learn that hydration changes the split. Say so next to the result."
- Missing to bookmark: "Shareable link with my settings, and a save button for my usual feed. The page remembers my numbers on this device, which I like, but I cannot send it to my husband."
- Trust: "Peak 14 to 20 hours at 68 F is a bit long for a ripe starter, but it says guide only. Fine."
- Come back: yes.

## Persona 4: Raj, 52, baker, expert, desktop (1440x900)
Runs a stiff rye starter, custom 1:2:1, wants 120 g.
Custom 1:2:1, 120 g, 100% rye. He got 240 g flour (0 white, 240 rye), 120 g water, hydration 50%. Then he tried edge cases: empty field, -5, 62.5 g, 40 F.
- Click on Google over the others? "Only if it shows custom ratios in the snippet. The presets are what I do not need."
- Under 30 seconds? "Yes."
- Confused me: "At 40 F it shows 'about 8 to 12 hours' and, under it, 'not reliable'. Show a dash or a fridge message, not a number I should ignore. When I type 62.5 g, the starter says 63 g. I typed 62.5. The hydration box is greyed with '100' while I use custom, which looks like a bug."
- Missing to bookmark: "Starter hydration as its own input (my starter is 60%, not 100%), a fridge option (feed, then cold ferment), and the real peak time at my actual temperature, not three buckets."
- Trust: "The math is right. The peak time is a model, so I treat it as a guess. It says so, good."
- Come back: "Maybe. I would use it to scale up a levain. Starter hydration would make it a yes."

## Persona 5: Linda, 63, retired teacher, low-tech, Android (412x915)
Her daughter gave her a jar. She measures in cups. She has no idea what ratios mean.
She left the defaults, tapped Cups, tapped 100 g and 1:1:1, then 200 g. She saw 3 1/2 tbsp, 2 1/8 cups, 1 cup. Later: 1/2 cup starter, 7/8 cup flour, 3/8 cup water, and "7/8 cup" for 200 g.
- Click on Google over the others? "I would click anything with a picture of bread. The name is clear."
- Under 30 seconds? "No. About two minutes. I did not know which button to press first."
- Confused me: "I do not own a 3/8 or 7/8 cup, or a 1/8 cup. My cups are 1/4, 1/3, 1/2 and 1. The total stays in grams when I picked cups. Words like hydration, ratio and ripe starter lose me."
- Missing to bookmark: "A simple beginner mode: one button, 'feed my starter', with steps. Bigger text. A picture of what ripe looks like."
- Trust: "I trust it because it says cups are a guess. I would still want a scale."
- Come back: "Yes, if my daughter bookmarks it for me."

## Ranked change list (5 personas)

### Must
1. **Show the answer on the first phone screen** (3 of 5: Jenna, Marcus, Linda). On a 390x844 phone the result card starts at y=902, below the fold, and at 375x667 it starts at y=626 with little visible. Put a compact result (starter, flour, water) right under the title, or a sticky result bar, or move the result above Fine-tune.
2. **Cups: use real measuring-cup fractions** (2 of 5: Jenna, Linda). It shows 3/8, 7/8 and 1/8 cup. Round to 1/4, 1/3, 1/2, 2/3, 3/4, 1 cups and tbsp or tsp for small amounts, and keep the "grams are better" note. Also show the total in cups mode, or label it clearly as grams.
3. **Explain that hydration changes the split, next to the result** (2 of 5: Dana, Raj). 1:10:10 at 80% gives 222 g flour and 178 g water, but the label still says 1:10:10. Add a line such as "At 80% hydration the flour and water split is 222 / 178, not equal parts." Or show the actual ratio.

### Should
4. **Give a time of day for the peak** (1 of 5: Marcus). Add an optional "fed at" time and show "ready about 5 to 8 am".
5. **Make the discard step exact** (3 of 5: Marcus, Jenna, Linda). In Total mode: "Discard extra starter" does not say how much. Add "Keep 40 g in the jar, discard the rest" and a short step list: discard, add flour, add water, stir, wait.
6. **Peak time at extreme temperatures** (1 of 5: Raj, but easy fix). At 40 F show a dash or a fridge note instead of "about 8 to 12 hours" next to "not reliable".
7. **Plain labels for beginners** (3 of 5: Jenna, Linda, Marcus). Rename "Starter I keep" / "Total I need" with a one-line example each, replace "Ripe starter" with "Starter", and fix "1 parts flour" (grammar bug in the ratio hint for custom and 1:1:1).
8. **Shareable link with the settings** (2 of 5: Dana, Marcus). Put the values in the URL so a bookmark or message keeps them. The page already remembers values on the device.
9. **Starter hydration input** (2 of 5: Raj, Dana). The page assumes the starter has the same hydration as the feed. Add "my starter is at X%".

### Nice
10. Do not round the starter amount you typed (62.5 g shows as 63 g) or show one decimal (1 of 5: Raj).
11. Grey "100" in the hydration box while Custom is active reads as a bug; hide the box or explain in place (1 of 5: Raj).
12. Fridge/storage mode: feed, then cold ferment (1 of 5: Raj; Jenna wanted "what to do with discard", 1 of 5).
13. Larger-text option or a one-button beginner mode (1 of 5: Linda).

## What worked (do not break)
- Maths is correct and sums add up in every case tried (30 g 1:1:1, 200 g total at 1:2:2 with 80/20 wheat, custom 1:2:1 with 100% rye).
- Errors are clear for empty and negative amounts. No horizontal scroll at 375, 390, 412 or 1440 widths.
- Copy amounts works. Values persist on reload. The article's worked example matches the tool.
- Desktop layout: inputs and result sit side by side on one screen.
