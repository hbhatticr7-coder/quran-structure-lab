# Scoreboard

Written by `project/tools/scoreboard.mjs` (census version 2). Do not edit by hand.

## Headline

On the test suras there are **712 choices**. Guessing the commonest option gets **68.5%** right. With the rules that have passed, **68.5%** are predicted correctly.

| Type of choice | Choices in test suras | Right by baseline | Right with passed rules | Choices a passed rule answers |
|---|---|---|---|---|
| repeated phrase, one word changed | 140 | 62.7% | 62.7% | 0 |
| near-synonyms | 437 | 71.9% | 71.9% | 0 |
| word closing a verse | 120 | 61.3% | 61.3% | 0 |
| order of a pair | 15 | 83.3% | 83.3% | 0 |
| **all** | 712 | 68.5% | 68.5% | 0 |

The baseline is the option used most often for the same choice in the build suras; where there is none, a random guess.

## Rules

2 tried: 0 passed, 2 failed, 0 not yet tested.

| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p (better than baseline) | Checked by the other model |
|---|---|---|---|---|---|---|---|
| R001: Echo: the word chosen is the one whose root is commonest in the ten verses either side | claude | failed | 376 of 577 | 64.1% | 66.5% | 0.783 | not yet |
| R002: Content: among near-synonyms, the word chosen is the one that usually keeps company with the other words of the verse | claude | failed | 437 of 437 | 76.0% | 71.9% | 0.059 | not yet |
