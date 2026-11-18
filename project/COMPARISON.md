# Comparison texts: first predictive test

Codex, 2026-11-18. **No comparison result meets the project's p < 0.01 bar. The samples are too small, and the text representations too different, to rank the Quran against these collections.** The clearest finding is how little text this strict phrase census covers after problems are defined on build sections alone.

The method, split and code were pushed before testing. The recorded test used commit [`898b59f`](https://github.com/hbhatticr7-coder/quran-structure-lab/commit/898b59f7d39810a6b57997404a087a80574db39e). See [the protocol](COMPARISON_PROTOCOL.md), [source hashes and split](comparison/split.json), [build-fold results](comparison/build.json), and [test results](comparison/test.json). The Quran figures below are existing version-2 results from its census, scoreboard and ledgers; no Quran corpus was loaded or rescored.

## What was compared

The common problem is a repeated phrase with one word hidden and three tokens on either side. At least two choices must occur in the build sections before a phrase becomes a problem. A test choice outside those build options is counted separately as unseen.

| Collection | Unit | Build units | Test units | Reserved units | Token representation |
|---|---|---:|---:|---:|---|
| Quran, existing split | sura | 58 | 28 | 28 | all words; lemmas/forms, with roots |
| Matthew, Mark, Luke | chapter within book | 34 | 17 | 17 | content-word lemmas |
| Samuel, Kings, Chronicles, six books | chapter within book | 85 | 41 | 41 | content-word lemma identifiers |
| Mishnah, 63 tractates | tractate | 33 | 15 | 15 | Hebrew forms, excluding one-letter forms |

Comparison units were ranked by retained token count and dealt into build, test and reserve using the same quartet algorithm and seed as the Quran split. Their reserve sections were used only for initial length allocation and were excluded from problem construction and scoring. The Quran vault was not accessed.

Sources are [MorphGNT/SBLGNT](https://github.com/morphgnt/sblgnt), [Open Scriptures Hebrew Bible](https://github.com/openscriptures/morphhb), and the Hebrew Mishnah from [Sefaria](https://developers.sefaria.org/reference/get-v3-texts), using the repository's existing loaders. The downloaded Mishnah responses contain all 63 nested tractates; their edition metadata says Public Domain. Third-party texts remain in ignored local files.

## Census and baseline

The baseline selects the most frequent build option. A tie receives the expected score of a uniform guess across all options, matching the existing scorer. Percentages below exclude unseen options.

| Collection | Build-defined phrase problems | Known-option test choices | Unseen-option test choices | Baseline on all known-option choices |
|---|---:|---:|---:|---:|
| Quran | 233 | 140 | 29 | 62.7% |
| Matthew, Mark, Luke | 23 | 2 | 1 | 50.0% |
| Samuel, Kings, Chronicles | 94 | 27 | 29 | 45.7% |
| Mishnah | 384 | 13 | 7 | 38.5% |

These are phrase-only figures. The Quran's existing overall baseline, across all four problem types, is 68.5% on 712 choices; it is not the appropriate denominator for the phrase comparison.

## R001: echo

R001's file is unchanged. It counts option echoes in the ten surrounding context items on either side, including the current item with the answer hidden, and abstains on ties or no evidence. The Quran version can match roots; comparison inputs have no roots, so it matches lemmas or forms. The baseline column uses exactly the choices that echo answered.

| Collection | Answered / known-option choices | Correct | Accuracy | Baseline on same choices | Gain, percentage points | p, occurrence signs | p, unit signs |
|---|---:|---:|---:|---:|---:|---:|---:|
| Quran, existing score | 100 / 140 | 53 | 53.0% | 61.1% | -8.1 | 0.899 | not run |
| Matthew, Mark, Luke | 2 / 2 | 2 | 100.0% | 50.0% | +50.0 | 0.252 | 0.250 |
| Samuel, Kings, Chronicles | 22 / 27 | 13 | 59.1% | 47.7% | +11.4 | 0.264 | 0.500 |
| Mishnah | 13 / 13 | 10 | 76.9% | 38.5% | +38.5 | 0.0246 | 0.0313 |

The Mishnah gain is the largest supported by more than two answered choices, but still misses 0.01. Its answered choices lie in six tractates, only five with a nonzero net gain. Samuel–Kings–Chronicles has answered choices in five chapters, but only one with a nonzero net gain. Neither should be described as many independent successes. The two Gospel successes support very little inference.

The unit test flips one sign for each chapter or tractate. It is a sensitivity check, not a cure for repeated accounts across units. No comparison is being declared a passed Quran rule.

## R002 and the content-on-frames adaptation

**Unchanged R002 is inapplicable to these comparison problems.** It accepts near-synonym sets only, and no such comparison-language sets have been defined. Its existing Quran synonym result is 332/437 correct (76.0%), against 71.9% for the baseline, p = 0.059. That result was not rerun.

The protocol separately declared **C002_frame**, applying R002's unchanged classifier and settings to phrase problems. This is a different application; it has no Quran test score and does not alter R002's ledger.

| Collection | Answered / known-option choices | Correct | Accuracy | Baseline on same choices | p, occurrence signs | p, unit signs |
|---|---:|---:|---:|---:|---:|---:|
| Matthew, Mark, Luke | 0 / 2 | 0 | no answers | no answers | — | — |
| Samuel, Kings, Chronicles | 15 / 27 | 6 | 40.0% | 33.3% | 0.498 | 0.500 |
| Mishnah | 3 / 13 | 2 | 66.7% | 0.0% | 0.249 | 0.250 |

There are too few build examples for many frames to meet the classifier's six-example minimum. The zero baseline on the three Mishnah choices is a score on that small answered subset, not the baseline for the whole collection.

## Including unseen options and unanswered choices

For this table, unseen options count as misses for everyone. Where a rule abstains, use the baseline. Every column therefore uses all test sites matching a build-defined frame. Sites outside those frames still lie outside this census.

| Collection | All eligible test sites | Baseline | Echo, with baseline for abstentions | Content adaptation, with baseline for abstentions |
|---|---:|---:|---:|---:|
| Matthew, Mark, Luke | 3 | 33.3% | 66.7% | 33.3% |
| Samuel, Kings, Chronicles | 56 | 22.0% | 26.5% | 23.8% |
| Mishnah | 20 | 25.0% | 50.0% | 35.0% |

Exact corresponding Quran figures were not reconstructed from its rounded summaries; doing so would require a separately authorized evaluation change. The machine-readable comparison results also give accuracy among all answered sites including unseen options.

## What follows

This test neither establishes unusual Quranic predictability nor establishes arbitrary wording in any collection. The controls need more coverage and closer matching of tokenization, linguistic information and unit size. Any wider frame definition or new synonym sets should be developed on build sections and frozen before another test; this result is retained as it stands.

Eight artificial-fixture checks passed, covering test-only variation, masking and access limits, fixed splits, unseen options, abstentions, grouped signs, reserved-section exclusion, tokenization and build-only classifier input. An added fixture initially counted two valid slots while expecting one; its correction is recorded in the commit history before the test. The first test invocation stopped at a sandbox-denied Git preflight; the subsequent invocation completed the sole scoring run. No rule status changed, so the Quran scoreboard was not regenerated.
