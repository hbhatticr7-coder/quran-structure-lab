# Scoreboard

Written by `project/tools/scoreboard.mjs` (census version 4). Do not edit by hand.

## Headline

On the test suras there are **708 choices**. The baseline gets **77.4%** right. With the rules that have passed and been checked, **77.4%** are predicted correctly.

| Type of choice | Choices in test suras | Right by commonest option, form ignored | Right by baseline | Right with passed and checked rules | Choices such a rule answers | Places left out: word never seen there in the build suras |
|---|---|---|---|---|---|---|
| repeated phrase, one word changed | 140 | 62.7% | 62.7% | 62.7% | 0 | 29 |
| near-synonyms | 433 | 71.6% | 86.4% | 86.4% | 0 | 0 |
| word closing a verse | 120 | 61.3% | 61.3% | 61.3% | 0 | 95 |
| order of a pair | 15 | 83.3% | 83.3% | 83.3% | 0 | 0 |
| **all** | 708 | 68.3% | 77.4% | 77.4% | 0 | 124 |

**The baseline** is the option used most often for the same choice in the build suras; where there is none, a random guess. For near-synonyms it is the option used most often there *in the same grammatical form* (a verb's tense, a noun's definiteness). A rule is told that form too, so it can only beat the baseline with something more than grammar.

**What grammar alone settles.** For near-synonyms, knowing the form lifts the commonest-option guess from 71.6% to 86.4%. The largest part of that is one fact: of the two verbs for "to come", ja'a is used in the past tense and ata supplies the other forms (rule R003 below). That is counted as grammar, not as wording explained.

**What these numbers leave out.** A choice is counted only if the word used is one the build suras show in that place. In 124 further places in the test suras the word is a new one, which no rule and no baseline could name. Counting those as misses, the baseline is right on 65.8% of 832 places, and the passed and checked rules on 65.8%.

## Rules

5 tried: 1 passed, 4 failed, 0 not yet tested.

A rule passes only if it beats the baseline with p below 0.01 two ways: one sign per place, and one sign per sura (each sura's gains and losses summed). Each rule gets one test. With 5 tested so far, luck alone would be expected to pass at most about 0.05 of them. That is a rough upper figure, not an exact one: it assumes each test is fair, and rules written after seeing earlier results are not fully independent attempts. A pass counts toward the headline only after the other model has challenged it.

The method has changed 3 times as flaws were found (see `project/CENSUS.md`). Each rule is shown with the score from its own test and the method version it was tested under. A rule tested under an earlier version does not count toward the headline.

| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p, one sign per place | p, one sign per sura | Checked by the other model |
|---|---|---|---|---|---|---|---|---|
| R001: Echo: the word chosen is the one whose root is commonest in the ten verses either side | claude | failed (method version 3) | 373 of 573 | 63.8% | 66.3% | 0.777 | 0.902 | not yet |
| R002: Content: among near-synonyms, the word chosen is the one that usually keeps company with the other words of the verse | claude | failed (method version 3) | 433 of 433 | 76.0% | 71.6% | 0.0527 | 0.0636 | not yet |
| R003: "To come": ja'a in the past tense, ata in every other form | claude | passed (method version 3) | 159 of 433 | 91.8% | 58.5% | 0.00005 | 0.00005 | codex: holds in part |
| R004: "Fear": khawf for fear of what may happen, khashya for fear of a being (God or people) | claude | failed (method version 3) | 30 of 433 | 100.0% | 86.7% | 0.066 | 0.0611 | not yet |
| R005: "Human being": bashar when the word classifies someone as a human (indefinite), insan when it names mankind (definite) | claude | failed (method version 3) | 18 of 433 | 94.4% | 66.7% | 0.0627 | 0.158 | not yet |
