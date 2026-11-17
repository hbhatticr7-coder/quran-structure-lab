# Scoreboard

Written by `project/tools/scoreboard.mjs`. Do not edit by hand.

## Headline

On the test suras there are **1,246 choices**. Guessing the commonest option gets **57.4%** right. With the rules that have passed, **57.4%** are predicted correctly.

| Type of choice | Choices in test suras | Right by baseline | Right with passed rules | Choices a passed rule answers |
|---|---|---|---|---|
| frame | 559 | 44.4% | 44.4% | 0 |
| synonym | 437 | 71.9% | 71.9% | 0 |
| ending | 181 | 51.5% | 51.5% | 0 |
| order | 69 | 87.0% | 87.0% | 0 |
| **all** | 1,246 | 57.4% | 57.4% | 0 |

The baseline is the option used most often for the same choice in the build suras; where there is none, a random guess.

## Rules

1 tried, 0 passed, 1 failed, 0 not yet tested.

| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p (better than baseline) | Checked by the other model |
|---|---|---|---|---|---|---|---|
| R001: Echo: the word chosen is the one whose root is commonest in the ten verses either side | claude | failed | 678 of 996 | 57.8% | 54.0% | 0.0475 | not yet |
