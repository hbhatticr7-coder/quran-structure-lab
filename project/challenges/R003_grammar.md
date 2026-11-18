# R003 challenge: holds in part

Codex, 2026-11-18; task 17, claimed and pushed in `5022771`. This reviews the method-3 test recorded at `2cd11da214e7a8093d311b92e61a03ea36c82f58`. It is a post hoc challenge of an existing result, not another confirmatory test.

**Verdict: holds in part.** The tense association and the original numerical result hold. Every R003 prediction is also made by the method-4 grammar baseline, so the rule adds no explanation beyond that control. It remains an earlier-method pass in the ledger and does not qualify for the current headline.

Run `node project/challenges/R003_grammar.mjs`; its output is saved in `R003_grammar.json`. The script checks the frozen rule hash, split and synonym definitions, reproduces the historical counts and coverage measures, and asserts agreement with the grammar baseline at every answered test place. It uses the repaired loader for build and test suras only. It does not write scores or open the vault.

| Check | Places | R003 right | Plain baseline | Grammar baseline | R003 gain over grammar |
|---|---:|---:|---:|---:|---:|
| Existing test | 159 | 146 (91.8%) | 58.5% | 91.8% | 0 |
| Identical verses counted once | 159 | 146 (91.8%) | 58.5% | 91.8% | 0 |
| Each test sura omitted in turn (28 checks) | 126–159 | 90.5–92.7% | varies | identical to R003 | 0 throughout |

Identical means the same complete sequence of reconstructed written words, with the first verse in sura/verse order retained and all its choice slots kept. No target place is removed by this check. It does not rule out shared shorter phrases or dependence between nonidentical passages. Omission removes a sura from scoring; the defining build suras remain fixed. There are target choices in 21 test suras, so omitting one of the other seven leaves the result unchanged.

The gain over the old plain baseline survives these checks: the sura-block p-value is 0.00005 for the full sample and at most 0.00015 when a sura is omitted. Against the grammar baseline both gain p-values are 1. These are exploratory sensitivity checks; they do not create 28 independent confirmations. Since the two prediction vectors are identical, any further subsetting or reweighting that holds the predictions fixed also gives zero incremental gain.

Of 106 past-tense test places, 93 use jaa and 13 use ata. All 37 imperfect and 16 imperative places use ata. The 13 past-tense exceptions remain unexplained. Across all 433 synonym places, R003 answers only 159; under the original scoring, using the plain baseline where it abstains gives 83.8% correct versus 71.6% for that baseline alone. There are no unseen options in this synonym scope. With the grammar baseline standing in, both procedures give 86.4% across the 433 places. These percentages describe this census, not all Quranic wording.

The checks of all nine synonym sets are in `../METHOD_V4_REVIEW.md` and `method-v4-forms.json`. In the full build data, 13 of the 31 form classes contain only one option; six of those classes have at least three examples. Those are in-sample associations, not proof of certainty on new text. They explain why target grammar belongs in the control. Current `ctx.slot()` exposes only its declared coarse grammar; R003 uses only part of speech and `PERF`, so its result does not depend on the richer fields available under method 3.

R003 has no imports or answer table and reads no surrounding word. The remaining helper-freezing gap found in task 20 therefore does not account for its result. Its original method-3 run did use the loader that parsed excluded suras before filtering; reproducing its score with the repaired loader cannot undo that historical exposure. The rule's provenance also expressly acknowledges prior knowledge of the regularity from training and earlier whole-text work.

This challenge does not decide whether the two verbs form a single grammatical paradigm, whether either is freely substitutable, or whether the pattern is specific to the Quran. An appropriate early Arabic comparison remains task 16. Keep the descriptive regularity, preserve the old scores, and require a later explanation of the exceptions to improve on the grammar-matched baseline.
