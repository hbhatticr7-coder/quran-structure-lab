# Wider phrases and comparison experiment 2: results

Codex, 2026-11-19. Tasks 4 and 12.

The wider definition doubles the Quran's known-option phrase choices in the test suras, from **140 to 280**. The comparison collections also have substantially more choices. One control, predicting Quran surface words from verse content, has both unadjusted gain p-values below 0.01. The corresponding dictionary-word control does not. No native rule or scoreboard status changes, and these results do not establish a difference between the texts.

The complete method, source catalogue, protocol and build results were pushed in [dce3342](https://github.com/hbhatticr7-coder/quran-structure-lab/commit/dce334281264f822b9f75b0f44bad55edb8620be) before the single scoring run. The [protocol](PHRASE_COMPARISON_V2_PROTOCOL.md) records earlier test exposure. This is a new frozen procedure on reused test data, not independent blind confirmation. All declared arms are reported below.

Saved results: [build](comparison/v2/build.json), [test](comparison/v2/test.json), [build-only phrase diagnostics](phrase-build.json), and [compiled lexical sets](comparison/synonyms-v2.json). The first [comparison report](COMPARISON.md), its result files, and both original splits remain unchanged.

## What the wider census changes

Method 5 defines a local phrase using two written words on either side of the hidden word. It retains visible spelling and form. A separate alignment procedure can recognize a substitution when other words have been inserted elsewhere in a near-identical verse. Both definitions use build data only. Local frames own their slots first, and an unknown answer cannot change ownership. Every physical phrase slot is counted once.

| Native Quran phrase census | Previous definition | Method 5 |
|---|---:|---:|
| Problems defined in build suras | 233 | 334 |
| Build places | 725 | 1,290 |
| Known-option places in build validation folds | 114 | 375 |
| Known-option test places | 140 | 280 |
| Test places with an unseen answer | 29 | 103 |
| All eligible test places | 169 | 383 |

These are changed definitions, not a larger score on the same questions. Shorter contexts recover more places but also leave more unseen answers. Alignment adds **zero** Quran problems after local ownership; this negative finding was already present in the build run. In the comparison surface arms it contributes 3 Gospel, 16 Samuel–Kings–Chronicles, and 11 Mishnah problem definitions. Those counts describe templates, not additional answered test places.

The other native problem types are unchanged. The regenerated [census](CENSUS.md) has 848 known-option choices and 198 unseen places across all types. The [scoreboard](../SCOREBOARD.md) baseline is right on 73.7% of the known choices, or 59.8% of all 1,046 eligible places. No current-method rule qualifies for the headline. Different census types may ask different questions about the same word; none of these percentages is a share of all Quran words explained.

## Coverage and how to read the scores

The primary comparison retains all written words, including function words, and removes vowel/recitation marks. The separate lexical arm predicts dictionary tokens while retaining written context. Neither comparison arm gives a predictor roots or hidden-target grammar. Its baseline is the build majority for each problem, with expected uniform credit for ties. This differs from the native Quran grammar baseline.

| Collection | Build / test units | Known phrase choices, experiment 1 | Surface: known / unseen | Lexical: known / unseen |
|---|---:|---:|---:|---:|
| Quran | 58 / 28 suras | 140 native, separate baseline task | 352 / 146 | 280 / 103 |
| Gospels | 34 / 17 chapters | 2 | 144 / 111 | 138 / 93 |
| Samuel–Kings–Chronicles | 85 / 41 chapters | 27 | 132 / 128 | 50 / 50 |
| Mishnah | 33 / 15 tractates | 13 | 169 / 100 | No separate lemma arm |

All unit IDs and partitions are unchanged. Coverage changes combine a broader phrase definition and better word retention; they do not isolate either change's effect. Mishnah has no source lemma annotation. Its surface phrases are scored once, and its lexical contrast below uses explicit written forms.

In the tables, **right/answered** excludes abstentions and unseen answers. **Baseline** uses exactly those answered places. **p place** flips each place's gain or loss independently; **p unit** flips the total gain or loss of a whole sura, chapter or tractate. Both use the existing 20,000-draw procedure. Units are blocks, not equally weighted observations. **All places: predictor / baseline** counts unseen answers as misses and uses the baseline whenever the predictor abstains. It is the broader coverage figure to read beside answered accuracy.

All p-values are unadjusted descriptive results from multiple comparisons. A low value in one arm and a high value in another is not itself a test of a difference between texts.

## Common surface-word phrase controls

“Echo” is R001's unchanged prediction function, restricted to frames. “Content” is R002's unchanged prediction function applied to frames, as declared before testing. Roots are absent in both. Their identifiers in the saved output are `C001_echo` and `C002_frame`.

| Collection | Control | Right / answered | Accuracy | Baseline | p place | p unit | All places: predictor / baseline |
|---|---|---:|---:|---:|---:|---:|---:|
| Quran | Echo | 75 / 166 | 45.18% | 56.47% | 0.985 | 0.953 | 35.10% / 38.87% |
| Quran | Content | 135 / 203 | 66.50% | 55.99% | 0.00205 | 0.0016 | 43.15% / 38.87% |
| Gospels | Echo | 69 / 110 | 62.73% | 58.32% | 0.232 | 0.286 | 32.47% / 30.57% |
| Gospels | Content | 50 / 71 | 70.42% | 67.67% | 0.307 | 0.289 | 31.33% / 30.57% |
| Samuel–Kings–Chronicles | Echo | 68 / 95 | 71.58% | 57.64% | 0.00385 | 0.0102 | 33.30% / 28.21% |
| Samuel–Kings–Chronicles | Content | 50 / 79 | 63.29% | 53.95% | 0.067 | 0.0766 | 31.05% / 28.21% |
| Mishnah | Echo | 80 / 140 | 57.14% | 57.29% | 0.520 | 0.514 | 37.22% / 37.29% |
| Mishnah | Content | 45 / 71 | 63.38% | 63.73% | 0.585 | 0.606 | 37.20% / 37.29% |

Only Quran content has both displayed p-values below 0.01. It answers 203 of 352 known places, among 498 eligible places. Including all places, it raises accuracy from 38.87% to 43.15%, a gain of 4.28 percentage points. The separately declared unit calculation enumerates all signs when there are at most 16 nonzero blocks: here 9, giving p = 0.00195. This supports the numerical signal under that calculation; it does not settle its cause.

Samuel–Kings–Chronicles echo is close to the unit threshold: p = 0.0102, and the second unit calculation gives 0.0103 using simulation for 20 nonzero blocks. Neither recorded value is below 0.01. Do not rerun until a simulated value crosses the threshold.

The Quran signal is a lead for challenge, not a native pass. Surface targets include attached material and inflection; visible context may predict these. Repetition within or between units may also contribute. A challenge should separate those explanations from a word-choice claim. That follow-up is selected after seeing this outcome and must be labelled post hoc.

## Dictionary-word phrase controls

| Collection | Control | Right / answered | Accuracy | Baseline | p place | p unit | All places: predictor / baseline |
|---|---|---:|---:|---:|---:|---:|---:|
| Quran | Echo | 81 / 186 | 43.55% | 62.55% | 1 | 0.993 | 33.84% / 43.07% |
| Quran | Content | 132 / 189 | 69.84% | 61.19% | 0.00695 | 0.0388 | 47.34% / 43.07% |
| Gospels | Echo | 79 / 117 | 67.52% | 59.64% | 0.0903 | 0.0942 | 37.81% / 33.82% |
| Gospels | Content | 44 / 70 | 62.86% | 67.44% | 0.799 | 0.844 | 32.43% / 33.82% |
| Samuel–Kings–Chronicles | Echo | 24 / 37 | 64.86% | 50.30% | 0.067 | 0.122 | 30.50% / 25.11% |
| Samuel–Kings–Chronicles | Content | 13 / 30 | 43.33% | 40.37% | 0.501 | 0.504 | 26.00% / 25.11% |

None has both p-values below 0.01. Quran content has an occurrence-level gain but a unit p-value of 0.0388; exact enumeration of its 11 nonzero unit blocks gives 0.0396. Its native-equivalent phrase definitions therefore do not reproduce the surface arm's two-threshold result. These inputs omit roots, so this is still the declared comparison control, not a native evaluator run.

## R002 on the sourced lexical contrasts

The candidate list and build-attested option forms were frozen before testing. Each option needed five build examples. Quran rain and heart, and Greek love, failed that minimum and stayed excluded; no test search was used to rescue them. Seven Quran sets, two Greek sets, two Biblical Hebrew sets and one Mishnaic contrast qualified. Quran “swear” has no test occurrence.

R002 uses its unchanged settings. The baseline here ignores grammar. All included synonym places were answered and none had an unseen answer, so the all-place percentages equal the displayed accuracy and baseline.

| Collection | Right / answered | Accuracy / all places | Baseline / all places | p place | p unit |
|---|---:|---:|---:|---:|---:|
| Quran | 286 / 391 | 73.15% | 70.08% | 0.163 | 0.143 |
| Gospels | 372 / 402 | 92.54% | 94.28% | 0.982 | 0.962 |
| Samuel–Kings–Chronicles | 441 / 522 | 84.48% | 80.84% | 0.0153 | 0.0955 |
| Mishnah | 48 / 65 | 73.85% | 73.85% | 0.753 | 0.754 |

None has both p-values below 0.01. The high Gospel accuracy largely follows the common option; it is lower than its baseline. The Hebrew aggregate gains 19 correct predictions but does not clear either threshold. These are different sets and tasks, not comparable grades for the texts.

Every eligible set is retained below, including the one with no test places. These breakdowns are descriptive and do not replace the fixed aggregates.

| Collection | Set | Right / answered | Accuracy | Baseline | p place | p unit |
|---|---|---:|---:|---:|---:|---:|
| Quran | Send down | 43 / 60 | 71.67% | 83.33% | 0.975 | 0.990 |
| Quran | Fear | 42 / 52 | 80.77% | 80.77% | 0.693 | 1 |
| Quran | Swear | 0 / 0 | — | — | — | — |
| Quran | Year | 4 / 6 | 66.67% | 66.67% | 1 | 1 |
| Quran | Come | 108 / 159 | 67.92% | 58.49% | 0.0476 | 0.0574 |
| Quran | Human | 19 / 19 | 100.00% | 63.16% | 0.00785 | 0.0611 |
| Quran | Do | 70 / 95 | 73.68% | 76.84% | 0.777 | 1 |
| Gospels | Ask | 4 / 12 | 33.33% | 66.67% | 0.966 | 0.877 |
| Gospels | Speak | 368 / 390 | 94.36% | 95.13% | 0.940 | 0.938 |
| Samuel–Kings–Chronicles | Speak | 407 / 471 | 86.41% | 84.93% | 0.151 | 0.188 |
| Samuel–Kings–Chronicles | Heart | 34 / 51 | 66.67% | 43.14% | 0.0358 | 0.153 |
| Mishnah | Tree / wood | 48 / 65 | 73.85% | 73.85% | 0.753 | 0.754 |

The perfect Quran “human” result has gains in only four sura blocks; the exact unit p-value is 0.0625. It illustrates why place counts alone can overstate support. It does not change R005's separate historical result.

The [candidate sources](comparison/synonym-candidates.json) establish related glosses or forms, not interchangeability in every occurrence. The Hebrew heart pair includes shorter and longer forms. Mishnah's etz also includes wood and pole senses, and the explicit prefix/spelling list is not a morphological analyzer. No sense disambiguation was done.

## Checks, limits and next work

All 52 required and new checks passed under Node 24.22.3 before testing. New fixtures cover build-only options and prototypes, masked target independence, insertion alignment, one-owner slots, unknown-answer handling, all-word adapters, build minima, canonical spelling equivalence and all-place fallback. A catalogue normalization mismatch was found and repaired during build preparation, before the frozen test.

After the run, all 23 recorded input hashes matched the working files and the published commit. Every exported site belongs to a build sura, exports remain ordered by build counts, and the phrase export has no duplicate physical slot. A second invocation was refused before scoring; the saved test hash stayed `384db95cca25b717975cdb9a7eb9bea597b6fe7a4a0fa9300c1e640e978aa6cd`. Both splits, all native rule files and ledgers, and experiment 1's artifacts were preserved. No vault sura or comparison reserve was analyzed.

Better word retention does not equalize languages, segmentation, corpus size, genre, unit length or annotation. Chapters and tractates can contain related passages, and parallels can cross unit boundaries. Unknown-answer rates are substantial. Previously seen test outcomes and multiple descriptive arms limit inference further. The comparison asks what these fixed controls predict under these definitions; it does not rank literary quality or establish Quranic uniqueness.

The next task is an independent review of the phrase definition and the Quran surface-content signal, with repetition, unit omission and grammar checks, preserving this result and disclosing that the follow-up was prompted by it. Any later native rule needs the normal registration, frozen test and challenge process with its prior exposure stated. The alignment method's zero added Quran coverage and all unsuccessful comparison arms remain part of the result.
