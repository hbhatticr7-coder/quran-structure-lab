# Log

Newest first. One entry per session: date, who, what was done, what was found, what comes next.

## 2026-11-18, codex: replied to Claude and completed the independent version 3 review

**Done.** Pulled through `d2ad926`, read the updated charter and working rules in full, and answered discussion 6 in messages 7 and 8. Claimed task 14 and pushed the claim before reviewing. Wrote `project/CENSUS_V3_REVIEW.md` and three executable diagnostic checks.

**Found.** Version 3 fixes returned context access and whole-input synonym/root selection. The exported site contents contain only build occurrences. However, the loader still parses all morphology before filtering; the git guard accepts an ignored uncommitted helper; and it misses transitive dependencies through non-MJS files. The three additional fixtures reproduce those gaps. The existing rules do not use the helper patterns, and this review does not measure an effect on their scores. Other source findings concern validation order, missing-split regeneration and test-dependent ordering of otherwise build-only exports.

**Method reply.** Accepted the stricter prospective pass bar and Claude's point that a feature-free classifier uses the majority prior, with coverage/tie qualifications. Explained that sura blocks flip summed gains rather than give equal weight to sura accuracy, and that the chance-pass count needs qualification. Existing statuses and results stay unchanged.

**Validation and boundary.** The required existing test command passed (17 checks), as did the three new diagnostics. Only artificial morphology and temporary Git repositories with local origins were used for the new checks. The actual corpus was not opened; no vault run, new rule test or rescoring occurred. The split and ledger were unchanged. The current build-only site exports were validated against the build IDs without calling the corpus loader.

**Next.** Task 15, placed first, closes these gaps before more tests. Tasks 4 and 12 remain open for the wider phrase comparison after that repair. Task 14 is complete; this session's work is the requested independent review.

## 2026-11-18, claude: Codex's audit confirmed and fixed (census version 3); both rules re-scored, both still fail

**Checked.** Pulled Codex's work: answers to my five questions, the comparison run (`project/COMPARISON.md`) and the audit of census version 2 (`project/CENSUS_V2_AUDIT.md`). Ran its 16 checks; all pass. Read the audit against the code: all four findings are real. Confirmed that no third-party text was committed.

**Fixed (task 13, commit `b3681d4`, pushed before re-scoring).** A run loads only the suras it may see, and no tool loads the vault without the owner's flag. A rule can read only its own sura and the suras it learns from. Near-synonym options are explicit lists of dictionary forms compiled from the build suras. Roots come from the defining suras. A test run is refused unless every input is committed and pushed, and their hashes go into the ledger. `project/sites/` holds build occurrences only. Codex's four defect checks now check prevention.

**Pass mark tightened.** A rule must beat the baseline at p < 0.01 counting every place once and counting every sura once. Scores also report places with an unseen word, and accuracy over all places with those counted as misses.

**How much the leak mattered.** 4 of 712 test choices (3 in "fear", 1 in "rain") used a dictionary form that never occurs in the build suras. They are no longer occurrences. The test suras now hold 708 choices; the baseline is right on 68.3%. A further 124 places use a word never seen there in the build suras; counting those as misses the baseline is right on 58.2% of 832.

**Re-scored once each under version 3.**

| Rule | Right | Baseline | p, places | p, suras | Status |
|---|---|---|---|---|---|
| R001 echo | 63.8% of 373 | 66.3% | 0.78 | 0.90 | failed |
| R002 content, near-synonyms | 76.0% of 433 | 71.6% | 0.053 | 0.064 | failed |

Nothing changed in substance. The earlier scores are kept in each ledger file.

**A correction to my last entry.** I read R002's small shuffle p-value as "mostly the same information as which word is commoner". Codex pointed out that the shuffle keeps each problem's frequencies, so that reading was wrong. The verse's words are associated with the choice of synonym; the association is too weak to overturn the commoner word often enough to pass.

**The vault.** Versions 1 and 2 loaded the vault suras, counted their choices and wrote them into `project/sites/`. No rule was scored there. The vault is sealed from now on, not untouched from the start; `PROJECT.md` says so.

**Next.** Task 2 (stated rules for four synonym sets) for me. I have asked Codex to try to break version 3 and to take tasks 4 and 12 together (a wider phrase definition on all four texts).

## 2026-11-18, codex: comparison task and census audit completed

**Done.** Authentication was restored, the shared queue was checked, and the previously committed replies and task-1 claim were pushed before implementation. Added a comparison-only runner, a fixed protocol and split, source hashes, build results and a one-time test result. The frozen method was pushed before scoring at commit `898b59f`. Wrote `project/COMPARISON.md` and closed task 1.

**Found.** The strict phrase census leaves only 2 known-option test choices in Matthew–Mark–Luke, 27 in Samuel–Kings–Chronicles and 13 in the Mishnah. Echo gets 2/2, 13/22 and 10/13 of its answered choices right, versus baseline accuracies of 50.0%, 47.7% and 38.5% on those same choices. Its p-values are 0.252, 0.264 and 0.0246; all miss 0.01. Grouping signs by chapter/tractate gives 0.250, 0.500 and 0.0313. These samples and differently annotated languages cannot establish a ranking of literary care or Quranic uniqueness.

**R002 scope.** Unchanged R002 accepts synonyms only and has no applicable comparison problems. A separately declared adaptation applied its unchanged classifier to frames; it also missed the threshold. The report keeps this distinction explicit and includes unseen-option counts and scores with the baseline filling abstentions.

**Checks and boundaries.** Eight artificial-fixture checks passed. A new fixture initially created two valid slots while expecting one; the correction and the premature pass statement in the first freeze commit are documented by a follow-up commit before test scoring. A sandbox denial stopped the first test command at its Git preflight; no test data were scored until the successful invocation. No Quran corpus was loaded, no vault was accessed, no split or ledger was changed, and all fetched texts stayed ignored. Rule statuses did not change, so the scoreboard was not regenerated.

**Audit.** After separately claiming and pushing task 3, reviewed version 2 and batch 4. Eight additional artificial checks confirmed that the original frame-selection fix works, but synonym vocabulary/count selectors and root lookup still use the whole input, and loading/context access do not enforce the split. No real corpus was opened for these checks. Documented the distinction between batch 4's whole-text association test and version 1's faulty predictive baseline. Confirmed that R002's shuffle is within problem, so a constant majority guess alone cannot explain its small shuffle p-value. See `project/CENSUS_V2_AUDIT.md` and discussion message 5. Closed task 3 without changing old results or runtime census code.

**Next.** Task 13, placed first, repairs partition enforcement and input/dependency freezing before more rule tests. It also adds a safe build-only frame export for concrete examples. Task 12 addresses comparison coverage, representation matching and sourced synonym sets. Both requested tasks are complete; their follow-up work remains explicit in the queue.

## 2026-11-18, codex: methodological replies; comparison claim awaiting authentication

**Done.** Pulled the current repository and read PROJECT.md, AGENTS.md, the discussion, queue and recent log. Answered the five methodological questions from discussion messages 1 and 2 in message 3. Committed the replies and, separately, the one-line claim for task 1 (comparison texts).

**Assessment.** The project can measure how well stated rules predict the choices they cover. That does not establish that every word is indispensable, and a failed rule does not establish arbitrary wording. Recommended reporting coverage and unseen options, accounting for repeated passages and the family of tested rules, and retaining the declared baseline. Suggested the dictionary of usage and a checked map of speakers, claims and replies as useful longer-term outputs. These are proposals; no scoring policy or existing result was changed.

**Blocker.** GitHub rejected the saved credentials when pushing the replies and claim, including a retry without environment-token overrides. The connected GitHub app has read access but no push permission. The claim exists only locally; the shared queue is still open. Task implementation has not started because AGENTS.md requires a successful claim push first. No corpus or vault suras were accessed, no rule was evaluated, and no ledger or split was changed.

**Next.** Restore GitHub CLI authentication, fetch the shared queue again to check for competing claims, and push the claim if it is still available. Then complete task 1. The build-only frame inspection and version 2 audit in task 3 remain pending; discussion message 3 explicitly does not certify the code.

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
