# Pre-registration, batch 1

Written 2026-11-14, before any of the tests below were coded or run.
Only the rebuild check (T0, `scripts/01_replicate.mjs`) had been run at this point.
The SHA-256 of this file is recorded in `results/batch1.json` when the tests run.
This is an internal pre-registration: it is not yet timestamped by a third party.

## What is being tested

Claims are in `claims/registry.json`. Batch 1 covers Farrin's 53 sura pairs, his 19 sura groups, and his ring outlines for suras 2, 3 and 12. Sura 18 is re-tested but is not confirmatory.

## Measures

**M2 (primary): distinctive shared vocabulary.**
Each unit (a sura, or a section of a sura) is a bag of lemmas of root-bearing words.
Weight of a lemma in a unit = ln(1 + count) × idf. Similarity = cosine of the weight vectors.
For sura-level tests, idf = ln(114 / number of suras containing the lemma).
For section-level tests, idf = ln(6236 / number of verses containing the lemma).

**M1 (secondary): exclusive shared formulas.**
A run of n consecutive content roots inside one verse that occurs in exactly two verses of the Quran, in different suras. Sura-pair weight = number of distinct verse pairs so linked. Reported for n = 3 and n = 5.

Both measures detect lexical correspondence only. A purely thematic correspondence with no shared distinctive wording is invisible to them. A null result therefore means "no lexical signature found by this measure", not "the claim is false".

## Primary tests

Three primary tests, each one-sided, Bonferroni threshold 0.05 / 3 = 0.0167. 100,000 random draws, seed 20261114.

**T1. Pairs.** Statistic: mean M2 similarity over the 53 claimed pairs.
Null: random tilings of suras 1..114 by 53 adjacent pairs and 8 singles (a random ordering of the 61 tiles). This keeps every pair adjacent, so length, period and position are controlled; only the choice of where pairs start is random.

**T2. Groups.** Statistic: for d = 1, 2, 3, take all sura pairs (i, i+d) within suras 2..112; compute mean M2 similarity of same-group pairs minus mean of cross-group pairs; average over d.
Null: the same 19 group sizes in random order along suras 2..112, i.e. random placement of the group boundaries.

**T4. Rings (suras 2, 3, 12 combined).** For each sura, the statistic is the sum of M2 similarities over the claimed mirror pairs. The null is every other way of pairing up the non-central sections with the centre held fixed (15 pairings for suras 2 and 3; 945 for sura 12). Each sura gets a z-score against its own null; the combined statistic is the sum of the three z-scores, with its null from independent random pairings in each sura.
Per-sura exact p-values are also reported.

## Secondary and exploratory analyses (no confirmatory weight)

- T1 and T2 repeated with M1 (n = 3 and n = 5).
- T2 using d = 2, 3 only, which removes the adjacent-pair contribution.
- T1 effect size: claimed-pair similarity minus the mean of the two off-phase neighbours.
- Per-group breakdown for T2.
- T3: is the 5-gram clustering of suras 2-5 explained by size? Observed bridged verse pairs within each group against (a) an expectation proportional to the product of the suras' 5-gram counts and (b) a degree-preserving random rewiring of the bridge network (20,000 draws).
- Sura 18 ring re-test with the same matching null (15 pairings). Not blind.

## Rules

- Each primary test is run once. If a bug is found afterwards, the fix and both results are reported.
- All results are reported, including nulls.
- Any analysis added after seeing results is labelled post hoc.
