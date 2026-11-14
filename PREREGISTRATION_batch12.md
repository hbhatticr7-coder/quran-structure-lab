# Pre-registration, batch 12: a census of shapes

Written 2026-11-14, after batches 1 to 11. The two detectors (`src/concentric.mjs`) had been built and run on synthetic texts only (`scripts/11_synthetic_ring_check.mjs`, results in `results/synthetic_ring_check.json`). Neither had been run on any real text.
The SHA-256 of this file is recorded in `results/batch12.json`. Internal pre-registration only.

## Question

Earlier ring tests depended on a scholar's outline. Without any outline, how many suras show concentric (ring) structure or parallel structure in their wording, and is that more than in biblical chapters?

## Units

- Each text unit is cut into 12 blocks of equal size (by content words, at verse boundaries). Units with fewer than 300 content words, or that cannot be cut into 12 non-empty blocks, are left out.
- Quran: suras. Baseline: chapters of Genesis, 1-2 Samuel, 1-2 Kings, 1-2 Chronicles (Hebrew) and of Matthew, Mark, Luke (Greek).
- Block similarity: tf-idf over lemmas with verse-level weights from the unit's own corpus, as in earlier ring tests.

## Detectors and their measured error rates

**Ring.** High similarities line up along one anti-diagonal of the block matrix, at least three mirror pairs, blocks at least three apart. A unit counts as a ring only if two scoring methods both give p < 0.05 and agree on the centre. On synthetic text this rule fired on 2.3% of structureless texts, 7.3% of its worst non-ring case (one long uniform section followed by a short one), 100% of strong planted rings and 67% of weak ones.

**Parallel.** High similarities line up along one off-diagonal (blocks a fixed distance apart, at least three). Counts at p < 0.05. On synthetic text: 6.0% of structureless texts, at most 2.7% of other non-parallel structures, 100% of planted parallels.

5,000 permutations per test, seed 20261180 plus the unit's index.

## Tests

**C1 (primary). Do suras show rings more often than the detector's false-alarm rate?** The number of suras counted as rings, against a binomial with rate 0.073 (the worst false-alarm rate measured). One-sided, p < 0.05.

**C2 (primary). Do suras show rings more often than biblical chapters?** Fisher's exact test on the two proportions, one-sided, p < 0.05.

**C3, C4.** The same two tests for parallel structure, with false-alarm rate 0.060.

Reported without a test:
- Whether sura 12 is detected. It is the one sura where an outline-based ring was confirmed (batch 1), so it is a check of the detector's power on a real case. It was not used to tune the detector.
- For each detected sura: the verses of the central blocks and of each mirror pair.
- Whether detected suras are ones for which rings have been proposed in the literature this project has on file (Farrin: 1, 2, 3, 12, 13, 50 to 56; this project: 18).

## Prediction, recorded before running

Rings: a small number of suras, somewhat above the false-alarm rate, and not clearly more than in biblical chapters. Sura 12 may be missed, because its sections are of very unequal length and equal blocks will blur them. Parallel structure: uncertain.

## How results will be read

- C1 and C2 pass: ring structure in the wording is a real and distinctive feature of some suras.
- C1 passes, C2 fails: rings occur, at about the rate found in biblical narrative.
- C1 fails: at this resolution, with shared wording as the only evidence, rings are not detectable beyond the detector's error rate. That would not contradict the outline-based result for sura 12.

## Limits stated in advance

- Twelve equal blocks is one resolution. A ring whose sections are unequal, or finer or coarser than a twelfth of the sura, can be missed.
- Biblical chapters are later divisions, not compositional units, so they are an imperfect counterpart to suras.
- Wording only; thematic rings are invisible.
- A long uniform section followed by a short one can trigger the ring detector. Detected suras should be read before being called rings.
