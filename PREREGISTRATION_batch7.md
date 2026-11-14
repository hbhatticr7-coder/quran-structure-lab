# Pre-registration, batch 7: the disconnected letters

Written 2026-11-14, after batches 1 to 6. At this point the opening letters of the 29 lettered suras had been extracted from the text and listed. No letter counts had been made and no similarity had been related to the letters.
The SHA-256 of this file is recorded in `results/batch7.json`. Internal pre-registration only.

## Background

Twenty-nine suras open with letters recited by name (alif lam mim, ha mim, and so on). Their purpose has been debated since the first centuries of Islam. Two ideas can be tested with counts:

1. The letters mark families: suras with the same letters belong together in content.
2. A sura's letters are unusually frequent in that sura.

Prior work found before writing this: Sayoud (Quranica, 2013) ran several computational analyses without a clear explanation; Ayatollahi (1986) analysed letter statistics; Rashad Khalifa's number-19 claims are widely rejected and depended on disputed counting choices. Two searches found no test of the family idea with controls for neighbourhood and date.

## The letters

From verse 1 of each sura (and verse 2 of sura 42): ALM in 2, 3, 29, 30, 31, 32; ALMS in 7; ALR in 10, 11, 12, 14, 15; ALMR in 13; KHY'S in 19; TH in 20; TSM in 26, 28; TS in 27; YS in 36; S in 38; HM in 40 to 46 (42 adds 'SQ); Q in 50; N in 68.

A sura's family is its verse-1 letters. Identical-letter families: ALM (6 suras), ALR (5), HM (7), TSM (2). That gives 47 same-letter pairs.

## L1. Do same-letter suras form families? (primary)

The pair regression of batches 2 and 6, on all 6,441 sura pairs.

- Response: vocabulary similarity as percentiles (batch 2's measure).
- Variable tested: SAME = 1 if the two suras have identical opening letters.
- Controls: BOTH (both suras have letters of any kind), mushaf neighbours, ln mushaf distance, ln(1 + Egyptian revelation-rank difference), same Meccan/Medinan type, difference in ln words, difference in ln words-per-verse, one fixed effect per sura.
- Test: coefficient of SAME, MRQAP with double semi-partialling, 10,000 permutations, seed 20261122, one-sided, threshold p < 0.05.

Same-letter suras mostly sit together in the mushaf and were, by the traditional lists, revealed close together. The mushaf-distance and revelation-order controls are there so that SAME measures something beyond being neighbours and contemporaries.

Secondary:
- Rhyme similarity (batch 6's measure) as the response.
- Noldeke's chronology.
- Vocabulary similarity computed with each sura's first five verses removed, since same-letter suras often share an opening formula about the Book.
- The HM family alone.
- **The separated ALM suras.** ALM opens suras 2-3 (Medinan, at the front of the mushaf) and 29-32 (Meccan, far away). The eight pairs joining the two blocks share letters but not neighbourhood or period. Their coefficient is the cleanest single check.
- Partial overlap: for lettered pairs whose letters differ, the share of letters in common (for example ALM against ALMR), with SAME among the controls.

## L2. Are a sura's letters unusually frequent in it? (primary)

- Counting rule, fixed here: letters of the written skeleton. All marks are removed; hamza-carrying forms count as their carrier (alif, waw, ya); a standalone hamza is not counted; alif maqsura counts as ya; ta marbuta counts as ha. The basmala and the opening letters themselves are excluded.
- For each sura and letter: rate = count / total letters. Each rate is standardised across the 29 lettered suras.
- Statistic: for each lettered sura, the mean standardised rate of its own letters; summed over the 29 suras.
- Null: the 29 letter-sets are shuffled among the 29 lettered suras (100,000 draws, seed 20261123). This asks whether each sura's own letters are more frequent in it than the letters of other lettered suras would be. Comparing only among lettered suras keeps period and style roughly matched. One-sided, threshold p < 0.05.

Secondary:
- A stricter count: only plain alif and alif wasla count as alif; ta marbuta and alif maqsura are counted as their own letters.
- Standardising across all 114 suras instead of the 29.
- A table of every sura-letter case with its rank among the 29 and among the 114.
- The single-letter suras 38 (sad), 50 (qaf) and 68 (nun) reported individually, since they are the most quoted cases.

## How results will be read

- L1 SAME positive, and the separated ALM pairs positive: the letters mark families of suras that share vocabulary beyond being neighbours and contemporaries.
- L1 SAME positive but the separated ALM pairs not: the family effect cannot be told apart from closeness in the mushaf and in time.
- L2 positive: the letters reflect the sound texture of their suras. L2 null: no such relation by this count.

## Limits stated in advance

- The traditional revelation orders may themselves have been shaped by the groupings, which would make the chronology control too strong or too weak in ways that cannot be checked here.
- A family effect would not say why. The letters could label suras composed together, or mark an early collection of suras that someone grouped by resemblance.
- Letter frequencies follow vocabulary. A sura about a subject whose key words contain qaf will be rich in qaf. L2 cannot separate "the letter was chosen to match the sura" from "the sura's subject happens to favour the letter".
- Any letter-count result depends on the counting rule; two rules are run.
- The 29 suras fall into few families, so the shuffle in L2 has limited resolution.
