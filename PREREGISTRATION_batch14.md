# Pre-registration, batch 14: the seams between suras

Written 2026-11-16, after batch 13 and before any of the analysis below was coded or run. Committed to the public repository before the batch's code was written.

## Purpose

From this batch on the project's aim is to map the Quran's design for study, and no longer to ask whether that design is unusual next to other texts. The rules stay the same: measures fixed in advance, everything reported.

## Question

A classical line of scholarship (*munasabat*; al-Biqa'i, al-Suyuti) holds that the close of each sura connects to the opening of the next. Batches 2, 6 and 11 showed that neighbouring suras resemble each other as wholes. This batch asks whether the resemblance sits at the boundary, and maps every one of the 113 seams.

## Definitions

- **Close** of a sura: its final verses, the fewest that contain at least 40 content words (the whole sura if it is shorter). **Opening**: its first verses, by the same rule.
- **Seam** N: the close of sura N and the opening of sura N+1.
- **Similarity**: tf-idf cosine over roots, with weights from all 6,236 verses. Roots are used because the classical examples are echoes of a word-family (guide / guidance), not of one exact word.

## Test S1 (primary): is the link at the boundary?

For every pair of neighbouring suras, compare two things:

- the seam: close of N with opening of N+1;
- the reverse: opening of N with close of N+1.

Both compare one opening with one close from the same two suras, so the general resemblance of the two suras, and any habit of openings or closes to sound alike, is the same in both. Only the direction differs.

Statistic: mean over the 113 pairs of (seam similarity minus reverse similarity). Null: random sign flips of the 113 differences, 100,000 draws, seed 20261200. One-sided, threshold p < 0.05.

## Secondary

- Windows of 20 and of 80 content words; windows of the last three and first three verses.
- Lemmas in place of roots.
- **How specific is the link to the next sura?** For each sura's close, the percentile of the next sura's opening among the openings of all other suras (chance is 0.50), and the same for the sura after next.
- The seams where the reverse is stronger than the seam are listed, not hidden.

## The map

For every seam: the verses in each window, the seam and reverse similarities, the percentile above, and the shared roots with the highest weights. Written to `results/seam_map.json` and to a readable `SEAMS.md`.

## Check against a published source

Farrin (2014), the one study on file, states a link at the boundary for eight pairs: 2-3, 4-5, 12-13, 22-23, 27-28, 38-39, 54-55 and 101-102. Their ranks among the 113 seams are reported. This is a description, not a test: he chose those eight because he saw a link there.

## Prediction, recorded before running

S1 will pass, modestly. A minority of seams will carry strong links and many will carry none that this measure can see.

## How results will be read

- S1 passes: on average the end of a sura is closer to the start of the next than the other way round, so part of the neighbour resemblance is a hand-over at the boundary.
- S1 fails: neighbouring suras resemble each other as wholes, but the boundary itself is not marked in shared word-families. Classical links based on meaning could still be there.

## Limits stated in advance

- Shared word-families only. A link of meaning without a shared root (a question at the end of one sura answered at the start of the next, for instance) is invisible.
- A 40-word window is a choice; two other sizes and a verse-based version are run alongside.
- For very short suras the opening and the close are the same verses, so those pairs contribute nothing to S1.
- The map lists shared roots by weight. Whether a given shared root is a meaningful link is a judgement for a reader.
