# Log

Newest first. One entry per session: date, who, what was done, what was found, what comes next.

## 2026-11-17, claude: project set up; rule R001 tested and failed

**Done.** Wrote the charter (`PROJECT.md`) and working rules (`AGENTS.md`). Built the census, the split, the scorer and the scoreboard. Wrote and tested the first rule.

**The census.** 629 problems and 4,910 places where the text makes a choice of the four kinds defined so far: 2,101 in repeated phrase frames, 1,659 among 9 sets of near-synonyms, 824 verse endings, 326 paired words that occur in both orders.

**The starting line.** On the test suras, guessing the commonest option is right 57.4% of the time. No rule has passed, so that is the score to beat.

**Rule R001 (echo): failed.** The rule says the word chosen is the one whose root is commonest in the ten verses either side.

| | Answered | Right | Baseline on the same | Gain | p (better than baseline) |
|---|---|---|---|---|---|
| Build suras | 1,200 of 1,808 | 57.3% | 50.1% | +7.1 points | 0.00005 |
| Test suras | 678 of 996 | 57.8% | 54.0% | +3.9 points | 0.048 |

The gain halved on the test suras and missed the pass mark of p < 0.01. By type on the test suras: phrase frames +6.7 points (p = 0.012), synonyms no gain. Before testing, verse endings were dropped from the rule because it did worse than the baseline there on the build suras.

**What this says.** The echo effect of batch 4 is real as a tendency (the rule's answers match the real choices better than shuffled ones, p = 0.013), but as a way of predicting the choice it adds little to knowing which option is commoner. For synonyms it adds nothing. Nearness of the same root is not what decides a word.

**Next.** The first queue task: a sharper echo rule for phrase frames only, tuned on the build suras. Then verse endings.
