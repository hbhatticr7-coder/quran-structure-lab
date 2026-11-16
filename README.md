# Quran Structure Lab

Tests published claims about the Quran's structure against explicit null models, and reports every result including the failures.

## Run

Third-party comparison data is not stored here. Fetch it first (needed for batches 3, 5 and 12):

```bash
bash scripts/00_fetch_external.sh
```

Needs Node 20 or later. No packages to install.

```bash
node scripts/01_replicate.mjs
```

```bash
node scripts/02_batch1.mjs
```

Batch 2 (the arrangement test) needs the revelation-order table first, then takes about 15 minutes:

```bash
node scripts/03_build_chronology.mjs
```

```bash
node scripts/04_batch2_arrangement.mjs
```

Batch 3 (Yusuf against Genesis):

```bash
node scripts/06_batch3_genesis.mjs
```

Batch 4 (near-twin verses; add `--count` to see only how many cases the rules yield):

```bash
node scripts/07_batch4_twins.mjs
```

Batch 5 (the same phrase test on the Synoptic Gospels and on Samuel-Kings-Chronicles; `--check` runs only the code check):

```bash
node scripts/08_batch5_comparison.mjs
```

Batch 6 (rhyme; about 8 minutes):

```bash
node scripts/10_batch6_sound.mjs
```

Batch 7 (the disconnected letters; about 8 minutes):

```bash
node scripts/12_batch7_letters.mjs
```

Batch 8 (seven theories about the letters; about 4 minutes):

```bash
node scripts/14_batch8_letter_theories.mjs
```

Batch 9 (three further predictions about the letters):

```bash
node scripts/15_batch9_my_theories.mjs
```

Batch 10 (a validated search for what distinguishes lettered suras):

```bash
node scripts/16_batch10_class_signature.mjs
```

Batch 11 (why the mushaf departs from longest-first order):

```bash
node scripts/17_batch11_mushaf_order.mjs
```

Batch 12 (outline-free census of ring and parallel structure; the detectors are checked on synthetic text by `scripts/11_synthetic_ring_check.mjs`):

```bash
node scripts/19_batch12_shape_census.mjs
```

Batch 13 (the Mishnah as a second length-ordered collection):

```bash
node scripts/21_batch13_mishnah.mjs
```

Batch 14 (the seams between suras; also writes `SEAMS.md`):

```bash
node scripts/22_batch14_seams.mjs
```

Batch 15 (classical claims about near-synonyms; also writes `ATLAS.md`):

```bash
node scripts/23_batch15_word_atlas.mjs
```

Batch 16 (the retold stories; also writes `RETELLINGS.md`):

```bash
node scripts/24_batch16_retellings.mjs
```

Results are written to `results/`. Runs are seeded and reproducible.

## Layout

- `claims/registry.json`: each claim, its source, and whether the data had been seen before the test was specified.
- `PREREGISTRATION.md`: measures, nulls and thresholds, written before the tests were coded.
- `REPORT.md`: short report of what held, what is suggestive and what failed.
- `RESULTS.md`: findings and limits, batch by batch.
- `src/`: corpus loaders (Arabic, Hebrew, Greek), formula finder, vocabulary similarity, rhyme extractor, ring and phrase tests, pair-data regression, statistics helpers.
- `scripts/`: one script per batch.
- `data/`: morphology and text.
- `sources/` (not in the repository): extracted text of copyrighted books, kept locally for claim transcription only.
- `PREREGISTRATION_HASHES.txt`: SHA-256 of each test plan; the same hash is stored in each batch's results file.

## Method in brief

- Words are reduced to root and lemma using the Quranic Arabic Corpus morphology.
- Two measures: distinctive shared vocabulary (tf-idf cosine over lemmas) and exclusive shared formulas (a run of consecutive roots found in exactly two verses, in different suras).
- Every claim is compared with the alternatives it could have been: other adjacent pairings, other boundary placements, other ways of pairing a sura's sections.

## Data

- `data/quran-morphology.txt`: mustafa0x/quran-morphology, a fork of Quranic Arabic Corpus v0.4 (GNU GPL; see `data/MORPHOLOGY_README.md`).
- `data/quran-uthmani.txt`: Tanzil Uthmani text v1.1 (CC BY 3.0; keep the copyright block).
- `data/external/tanzil/quran-data.xml`: Tanzil sura metadata (CC BY), source of the Egyptian revelation order and Meccan/Medinan type.
- `data/external/wikipedia/list_of_chapters.wikitext`: Wikipedia "List of chapters in the Quran" (CC BY-SA), source of Noldeke's order.
- `data/external/oshb/Gen.xml`: Open Scriptures Hebrew Bible, Genesis with lemma and morphology (CC BY 4.0).
- `data/external/oshb/` also holds 1-2 Samuel, 1-2 Kings and 1-2 Chronicles from the same source.
- `data/external/morphgnt/`: MorphGNT SBLGNT for Matthew, Mark and Luke (morphology CC BY-SA; the SBLGNT text has its own licence, see sblgnt.com/license).
- `data/chronology.json`: built from the two files above by `scripts/03_build_chronology.mjs`, which cross-checks them against each other.
