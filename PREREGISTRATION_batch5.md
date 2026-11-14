# Pre-registration, batch 5: is the Quran's local fit unusual?

Written 2026-11-14, after batches 1 to 4 and before any Greek or Samuel-Kings-Chronicles data were parsed or analysed. The files had been downloaded and their first lines inspected for format only.
The SHA-256 of this file is recorded in `results/batch5.json`. Internal pre-registration only.

## Question

Batch 4 (amended analysis) found that where two Quranic phrases differ by one word, the word used tends to recur in the ten verses around it (p = 0.0006). Writers in general repeat words within a passage. Do other bodies of parallel text show the same local fit, and how does its size compare?

## Comparison texts

- **Synoptic Gospels** (Matthew, Mark, Luke), Greek: MorphGNT SBLGNT. Three authors rewording shared material.
- **Samuel-Kings and Chronicles**, Hebrew: Open Scriptures Hebrew Bible, books 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles. The Chronicler rewords Samuel-Kings, and Kings repeats its own formulas.

The Gospels are the comparison that was proposed; Samuel-Kings-Chronicles is added as a second baseline in a second language.

## Method: the batch 4 phrase-level test, unchanged

- Content words: nouns (including proper nouns), verbs and adjectives.
- Unit of matching: the lemma. Greek and Hebrew have no root annotation, so the Quran is re-run at lemma level for this comparison. Batch 4's root-level Quran result is shown alongside.
- A frame is two content lemmas before a position and two after it, inside one verse. A frame is used if its occurrences show at least two different middle lemmas and lie in at least two documents (suras for the Quran, books for the other two).
- Fit: p(w | C) = (count + 0.5) / (content words in C + 0.5 x distinct lemmas in the corpus). For a frame, T = sum over occurrences of ln p(middle | context); the statistic is T(observed) minus its mean under permutation of the middles among the frame's occurrences, summed over frames. Null: 100,000 independent permutations within frames, seed 20261118, one-sided.
- Because the denominators cancel within a context, the excess depends only on counts and is comparable across corpora.

Contexts, as in batch 4:
- **Local (the comparison of interest):** the ten verses on either side, within the same document.
- **Whole document:** the sura or book, leaving out the verse.
- **Strict:** the document, leaving out the verse, the ten verses either side, and every verse of that document containing the same frame.

## Code check before the run

The batch 4 script is refactored into a general function. Before any new corpus is analysed, the general function must reproduce batch 4's root-level Quran figures exactly (65 frames; total excess 12.1552 whole sura, 18.9943 local, 7.1626 strict).

## What is reported

For each corpus and context: usable frames, informative frames, positive and negative frames, mean excess per informative frame with a 95% bootstrap interval (10,000 resamples of frames, seed 20261119), and the permutation p-value. Also the bootstrap interval of the difference in mean local excess between the Quran (lemma level) and each comparison text.

## How results will be read

- A comparison text shows local fit (its own p < 0.05) of similar or larger size: local fit of variant words is ordinary in parallel texts, and the Quran's result is not distinctive.
- Neither comparison text shows local fit while the Quran does, or the Quran's is larger with a difference interval excluding zero: the Quran's variants track their surroundings more closely than these texts do.
- Mixed: reported as mixed.

## Limits stated in advance

- The processes differ. In the Gospels and in Chronicles, a different author rewrites a source and also writes the surrounding passage, so local fit there partly reflects each author's habits. The Quran varies its own formulas in one voice.
- A Gospel or a book of Kings is far longer than most suras, so "whole document" is not the same kind of context across corpora. The local window is the like-for-like comparison.
- Three languages, three annotation schemes, and different verse lengths (ten verses is not the same amount of text in each).
- Lemma-level matching is stricter than root-level; the Quran is run both ways.
- Two comparison texts do not make a baseline for "human writing" in general.
