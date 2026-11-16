# Pre-registration, batch 19: reading the seams for meaning

Written 2026-11-16, after batch 18 and before any passage was summarised or judged. Committed to the public repository before the readers were run.

## Why this batch is different

Every earlier batch counted shared words. Batch 14 found that the close of a sura shares no more word-families with the opening of the next than the reverse pairing does, and noted that it could not see links of meaning: a prayer answered, a question taken up, a theme continued in other words. This batch tests for those by having passages read.

The reader is a language model. That raises a problem that word counts did not have: the model knows the Quran, including which sura follows which. The design below is built around keeping the judge blind.

## Design

**Passages.** For each sura, its close and its opening, by the batch 14 rule (the fewest verses holding at least 40 content words). The basmala and any disconnected letters are removed. Each passage gets a random code; the list linking codes to suras is kept outside the repository until the batch is finished.

**Step 1, gists.** Independent readers, each a fresh model instance with no access to this project's history, receive coded passages in Arabic in shuffled order. For each they write a gist of at most 60 words in plain English: what the passage says, asks, commands, promises or pictures. Rules: no proper names, no Arabic words, no quotation, no reference to where the passage comes from, nothing from outside the passage. Closes and openings go to different readers, so no reader sees both sides of a seam.

**Step 2, judging.** Different fresh readers see only gists. Each item gives the gist of one close and the gists of five openings in random order: the opening of the next sura and those of the four nearest other suras (two before, two after, shifted where a sura is near either end). The judge ranks the five from most to least likely to be the opening that follows, by connection of meaning.

The four alternatives are neighbours on purpose. Earlier batches showed that nearby suras resemble each other as wholes, so the question here is narrower: is the close linked to the next sura's opening in particular?

**Step 3, blindness check.** Another fresh reader is given 40 close-gists and asked to name the sura each comes from. If it identifies more than 25% exactly, the gists are leaking identity and the judging result is reported as compromised.

## Measures

- **Primary.** The mean rank given to the true next opening across the 113 seams (1 is best; 3.0 is chance). Null: ranks drawn at random, 100,000 draws, seed 20261230. One-sided, threshold p < 0.05.
- How often the true opening is ranked first (chance is 20%).
- Agreement between two judges on a subset of 38 seams.
- The seams the judges ranked first, listed with the reason each judge gave, set beside the batch 14 map of shared word-families.

## Prediction, recorded before running

Uncertain. I expect the true opening to be ranked a little better than chance (a mean rank around 2.7 to 2.9), and I would not be surprised by a null.

## How results will be read

- Passes, with the blindness check passed: read for meaning, the close of a sura is linked to the opening of the next more than to the openings of its other neighbours. Batch 14's null was then a limit of word counting.
- Fails: no such link is visible to these readers from gists.
- Blindness check failed: the result cannot be trusted either way.

## Limits stated in advance

- The readers are instances of one model family. They share whatever habits and blind spots it has, and they are not scholars of the Quran.
- A 60-word gist in English loses most of a passage. A link carried by a particular word or image may not survive.
- The judges may recognise passages despite the gists. The blindness check tests naming the sura, which is a strong form of recognition; weaker recognition could go undetected.
- A model's judgement of "connected in meaning" is a judgement. This measures whether independent readers, kept blind, pick the true continuation more often than chance. It does not measure why.
- The same 40-word windows as batch 14 are used; a link lying further inside a sura is outside them.
