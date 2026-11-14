# Pre-registration, batch 6: the sound layer

Written 2026-11-14, after batches 1 to 5. At this point the rhyme extractor (`src/rhyme.mjs`) had been written and checked against suras whose rhymes are well known (1, 96, 97, 103, 108, 112, 113, 114 and others), and the overall frequency of rhyme keys had been printed. No rhyme data had been related to sura order, to Farrin's pairs, or to vocabulary.
The SHA-256 of this file is recorded in `results/batch6.json`. Internal pre-registration only.

## Why this batch

Every earlier test counted vocabulary. Rhyme is a different kind of feature and has not been examined in this project, so it gives a fresh look at two things: the sura-pair finding of batch 2, and whether sound marks structure inside suras.

## Rhyme data

Each verse's final word, as pronounced in pause, is reduced to a key: the kind of vowel before the final consonant (long i/u, long a, short, or a consonant cluster) plus the final consonant, or a long-vowel ending. The -un, -in, -im rhymes are keys L+n and L+m; -ad is s+d; a verse ending in long a is A+0. For detecting runs of rhyme, a broader family merges all "long i/u + consonant" endings and all "long a + consonant" endings, because later suras mix these freely.

## R1. Do mushaf neighbours share rhyme? (primary)

This repeats the batch 2 model with rhyme in place of vocabulary.

- A sura's rhyme profile is the proportion of its verses with each key. Similarity of two suras = cosine of their profiles.
- Response: as in batch 2, each sura's similarities are turned into percentiles and the two directions averaged.
- Predictors: ADJ (mushaf neighbours), ln(1 + Egyptian revelation-rank difference), same Meccan/Medinan type, difference in ln words, difference in ln words-per-verse, and one fixed effect per sura.
- Test: coefficient of ADJ, MRQAP with double semi-partialling, 10,000 permutations, seed 20261120, one-sided, threshold p < 0.05.

Secondary:
- Farrin's 53 pairs and the other 60 adjacent pairs entered separately, and the difference between them (Farrin's pairs with ADJ among the controls).
- Noldeke's chronology in place of the Egyptian.
- ADJ with the five adjacent pairs of largest residual removed.
- **Cross-check on batch 2:** the batch 2 vocabulary model with rhyme similarity added as a control. Rhyme is a proxy for a sura's style and genre, so this asks whether the vocabulary effect of batch 2 is just suras of the same style sitting together.

## R2. Do rhyme shifts mark a change of subject? (primary)

- A boundary between verses i and i+1 is a **shift** if verses i-1 and i share a rhyme family, verses i+1 and i+2 share a different one. It is a **continuation** if all four share one family. Other boundaries are not used.
- Lexical discontinuity at a boundary = 1 minus the cosine similarity (tf-idf over lemmas, verse-level idf) of the three verses before and the three verses after, cut at the sura's edges.
- Suras with at least one shift and one continuation are used. Statistic: the mean over those suras of (mean discontinuity at shifts minus mean discontinuity at continuations). Null: shuffle the shift and continuation labels among each sura's boundaries, 100,000 draws, seed 20261121, one-sided, threshold p < 0.05.

Secondary: windows of two and of five verses; suras split at the median words-per-verse.

## How results will be read

- R1 ADJ positive: neighbours in the mushaf resemble each other in rhyme beyond what length and date predict. Together with batch 2, the arrangement tracks similarity in two independent features.
- R1 Farrin's pairs above other adjacent pairs: the pair structure shows up in a feature never used to propose it here. If not, the pair finding rests on vocabulary alone.
- Batch 2 cross-check: ADJ still positive with rhyme controlled means the vocabulary effect is not explained by style; ADJ gone means it is.
- R2 positive: where the rhyme changes, the subject tends to change.

## Limits stated in advance

- No comparison text. Nothing here says whether these properties are unusual; rhymed prose and poetry from the period are not available in analysed form.
- Scholars who proposed the pairs could hear the rhymes, so rhyme is independent of this project's earlier tests but not of their judgement.
- Rhyme varies strongly with period and verse length. These are controlled only through the listed covariates.
- The rhyme key is an approximation of pausal pronunciation built from the script.
- In R2, the short verses where rhyme shifts are most common give very small windows, so similarity there is noisy and the test may lack power.
