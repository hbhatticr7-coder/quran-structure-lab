# Log

Newest first. One entry per session: date, who, what was done, what was found, what comes next.

## 2026-11-18, claude: a flaw in the census found and fixed; rules R001 (re-scored) and R002 both fail

**The flaw.** Census version 1 decided what counts as a problem from the whole text. A repeated phrase counted only if its word varied somewhere. So a phrase seen once in the build suras and once in the test suras was certain to differ there, and the baseline (which repeats the build suras' word) was certain to be wrong. Any rule looked better against the baseline than it was. I found this while exploring why "the same phrase elsewhere in the sura" predicted worse than chance.

**The fix (census version 2).** Problems and their options are now defined from the build suras alone. For tuning, the build suras are dealt into two halves: problems are defined on one and scored on the other, both ways. The census shrank from 1,246 to 712 scored choices in the test suras, most of the loss in repeated phrases (559 to 140).

**The starting line under version 2.** Guessing the commonest option is right on 68.5% of the 712 test choices.

**Queue task 1 (repeated phrases): closed.** The gain that echo showed on repeated phrases was the flaw, not the text. Under version 2, echo is worse than the baseline on phrases in the build suras (50% against 56%) and no variant I tried beats it.

**Queue task 2 (verse endings): closed without a test.** Neither echo nor the content rule beats the baseline on verse endings in the build suras (66% against 70% for the content rule). Nothing was taken to the test suras. The better-defined version of this question is the divine-name closings (now task 7).

**Rule R002 (content), near-synonyms only: failed, narrowly.** The rule learns, from the build suras, which words keep company with each synonym, and picks the synonym whose usual company matches the verse.

| | Answered | Right | Baseline | Gain | p (better than baseline) |
|---|---|---|---|---|---|
| Build suras (half against half) | 776 of 795 | 69.7% | 64.3% | +5.4 points | 0.001 |
| Test suras | 437 of 437 | 76.0% | 71.9% | +4.1 points | 0.059 |

The pass mark is p < 0.01, so it fails. Its answers do match the real choices far better than shuffled ones (p = 0.00005): the words of a verse carry real information about which synonym is used. But most of that is already captured by knowing which synonym is commoner. On the build suras the gain came from "to come" (61% against 41%), "fear" (68% against 60%), "human being" (75% against 64%) and "to swear" (55% against 32%); "to send down" was worse than the baseline.

**Rule R001 (echo), re-scored under version 2: failed clearly.** 64.1% against 66.5% for the baseline. Its first score (57.8% against 54.0%, under version 1) is kept in the ledger as `earlierTests`.

**What this says so far.** Two general-purpose rules, nearness and company, do not predict the Quran's word choices better than "use the commoner word" by a margin that survives a strict test. That is a real finding about what does not decide the wording. The specific, classical accounts of each pair of words have not been tried yet, and they are the next step.

**Next.** Open up R002 for "to come", "fear" and "human being": which words drive its answers, and do they match the classical accounts? Write those as stated rules, one per set (task 2 in the new queue).

## 2026-11-17, claude: project set up; rule R001 tested and failed

**Done.** Wrote the charter (`PROJECT.md`) and working rules (`AGENTS.md`). Built the census, the split, the scorer and the scoreboard. Wrote and tested the first rule.

**The census.** 629 problems and 4,910 places where the text makes a choice of the four kinds defined so far: 2,101 in repeated phrase frames, 1,659 among 9 sets of near-synonyms, 824 verse endings, 326 paired words that occur in both orders.

**The starting line.** On the test suras, guessing the commonest option is right 57.4% of the time. No rule has passed, so that is the score to beat.

**Rule R001 (echo): failed.** (Scored under census version 1, which had a flaw; see the entry above.) The rule says the word chosen is the one whose root is commonest in the ten verses either side.

| | Answered | Right | Baseline on the same | Gain | p (better than baseline) |
|---|---|---|---|---|---|
| Build suras | 1,200 of 1,808 | 57.3% | 50.1% | +7.1 points | 0.00005 |
| Test suras | 678 of 996 | 57.8% | 54.0% | +3.9 points | 0.048 |

The gain halved on the test suras and missed the pass mark of p < 0.01. By type on the test suras: phrase frames +6.7 points (p = 0.012), synonyms no gain. Before testing, verse endings were dropped from the rule because it did worse than the baseline there on the build suras.

**What this says.** The echo effect of batch 4 is real as a tendency (the rule's answers match the real choices better than shuffled ones, p = 0.013), but as a way of predicting the choice it adds little to knowing which option is commoner. For synonyms it adds nothing. Nearness of the same root is not what decides a word.

**Next.** The first queue task: a sharper echo rule for phrase frames only, tuned on the build suras. Then verse endings.
