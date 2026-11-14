# Pre-registration, batch 10: what sets the lettered suras apart?

Written 2026-11-14, after batch 9 and before any of the analysis below was coded or run.
The SHA-256 of this file is recorded in `results/batch10.json`. Internal pre-registration only.

## Why this is different from earlier batches

Batch 8 showed that lettered suras resemble each other in vocabulary and rhyme. Batch 9 tested my guess about why (talk of scripture) and it failed. This batch does not test a guess. It searches for whatever distinguishes the lettered suras, which is exploration, so the procedure for checking that the findings are not noise is fixed here in advance.

## Data and model

- All 114 suras. Each sura's first three verses are removed, so the opening formula cannot produce the result.
- For any feature, the model is the one used in batch 9: feature ~ lettered + Medinan + Egyptian revelation rank + ln words + ln words-per-verse, weighted by content-word count. The quantity of interest is the t-statistic of "lettered".

## Part 1. Vocabulary

- Features: the rate per 1,000 content words of every root that occurs at least 30 times in the Quran and in at least 10 suras.
- **Validation by repeated split-half.** The suras are split at random into two halves, balanced for lettered status and for Meccan/Medinan. In one half, the 15 roots with the highest t and the 15 with the lowest are selected. In the other half, a single score is computed for each sura (summed rate of the 15 "high" roots minus summed rate of the 15 "low" roots) and tested for a lettered effect with the same model (Freedman-Lane permutation, 20,000 draws, one-sided). The halves are then swapped. This is repeated for 20 random splits (seeds 20261160 to 20261179), giving 40 confirmation tests.
- Pass mark: the median p of the 40 tests is below 0.05. If it is, the lettered suras have a vocabulary signature that carries over to suras not used to find it.
- **Stable roots.** A root is reported as distinguishing only if it is selected in at least 60% of the 40 half-samples. The full-data t is given for each.

## Part 2. Formal features

Nine features, fixed here, each tested on all suras with the same model (Freedman-Lane, 100,000 draws, two-sided), with Benjamini-Hochberg adjustment across the nine:

1. proper nouns per 1,000 words
2. imperatives per 1,000 words
3. share of verbs in the perfect tense
4. first-person plural verbs per 1,000 words
5. second-person verbs per 1,000 words
6. passive verbs per 1,000 words
7. vocative particle (ya) per 1,000 words
8. verbs as a share of content words
9. share of verses whose rhyme is long i/u plus a consonant (the -un / -in / -im type)

## Robustness

Part 1's stable roots are re-examined in Meccan suras only and with Noldeke's order in place of the Egyptian.

## How results will be read

- Validation passes: the stable roots and significant formal features describe what the lettered suras have in common beyond period and length.
- Validation fails: the class resemblance of batch 8 is real but spread too thinly across the vocabulary for individual words to be named; no list is offered as a finding.

## Limits stated in advance

- This describes a difference. It does not explain why those suras have letters.
- Period is controlled through one traditional chronology (with the other as a check), a Meccan/Medinan flag and verse length. Lettered suras cluster in the later Meccan period, and features typical of that period could show up here in spite of the controls.
- With 29 lettered suras, each half has about 14, so the validation has limited power.
- No prediction is recorded this time. My last one was wrong, and the point of this batch is to let the data speak.
