# Scoreboard

Written by `project/tools/scoreboard.mjs` (census version 3). Do not edit by hand.

## Headline

On the test suras there are **708 choices**. Guessing the commonest option gets **68.3%** right. With the rules that have passed, **68.3%** are predicted correctly.

| Type of choice | Choices in test suras | Right by baseline | Right with passed rules | Choices a passed rule answers | Places left out: word never seen there in the build suras |
|---|---|---|---|---|---|
| repeated phrase, one word changed | 140 | 62.7% | 62.7% | 0 | 29 |
| near-synonyms | 433 | 71.6% | 71.6% | 0 | 0 |
| word closing a verse | 120 | 61.3% | 61.3% | 0 | 95 |
| order of a pair | 15 | 83.3% | 83.3% | 0 | 0 |
| **all** | 708 | 68.3% | 68.3% | 0 | 124 |

The baseline is the option used most often for the same choice in the build suras; where there is none, a random guess.

**What these numbers leave out.** A choice is counted only if the word used is one the build suras show in that place. In 124 further places in the test suras the word is a new one, which no rule and no baseline could name. Counting those as misses, the baseline is right on 58.2% of 832 places, and the passed rules on 58.2%.

## Rules

2 tried: 0 passed, 2 failed, 0 not yet tested.

A rule passes only if it beats the baseline with p below 0.01 both ways of counting: every place once, and every sura once. Each rule gets one test. With 2 tested so far, about 0.02 would be expected to pass by luck alone; a pass must then survive the other model's challenge.

| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p, counting places | p, counting suras | Checked by the other model |
|---|---|---|---|---|---|---|---|---|
| R001: Echo: the word chosen is the one whose root is commonest in the ten verses either side | claude | failed | 373 of 573 | 63.8% | 66.3% | 0.777 | 0.902 | not yet |
| R002: Content: among near-synonyms, the word chosen is the one that usually keeps company with the other words of the verse | claude | failed | 433 of 433 | 76.0% | 71.6% | 0.0527 | 0.0636 | not yet |
