# Pre-registration, batch 9: three predictions of my own about the letters

Written 2026-11-14, after batch 8 and before any of the tests below were coded or run. Before writing, the roots and lemmas named below were looked up in the corpus to confirm their spelling and total counts. Their distribution across suras was not examined, with one exception noted under M2.
The SHA-256 of this file is recorded in `results/batch9.json`. Internal pre-registration only.

## The theory

Batches 7 and 8 leave this picture: the letters behave like a constructed sample of the alphabet (distinct shapes, fixed order, balanced sounds), they are fitted to the recitation (rhyme), and they sit on one class of suras that resemble each other.

My reading: the letters put the alphabet itself on display at the head of the suras whose subject is the scripture as a text, an Arabic recitation and writing. If so, three things should follow that have not been checked.

## M1. Lettered suras talk about scripture and writing throughout, not only in their opening

- Lexicon, fixed here: the roots k-t-b (book, write), q-r-' (recite, Qur'an), t-l-w (recite), q-l-m (pen), s-h-f (scrolls), l-s-n (tongue, language), w-h-y (reveal), n-z-l (send down), s-t-r (inscribe; the lemma musaytir is left out), and the lemma 'arabi (Arabic; a'rab, Bedouins, is left out).
- Each sura's rate = lexicon words per 1,000 content words, with verses 1 to 3 removed so that the opening formula cannot produce the result.
- Model: rate ~ lettered + Medinan + Egyptian revelation rank + ln words + ln words-per-verse, weighted by the sura's content-word count. Test: coefficient of lettered, permutation of residuals (Freedman-Lane), 100,000 draws, seed 20261140, one-sided, threshold p < 0.05.
- Secondary: Meccan suras only; a narrower lexicon without w-h-y and n-z-l (words for books, recitation, writing and language only); verses 1 to 3 kept; Noldeke's order.

Prediction: positive.

## M2. "Arabic" belongs to the lettered suras

- The lemma 'arabi occurs 11 times. Statistic: how many fall in lettered suras. Null: each occurrence lands in a sura with probability proportional to its content words (binomial). One-sided.
- **Not blind.** I recalled from memory, before writing this, that most occurrences are in lettered suras. The count is reported for what it is.

## M3. The fixed order runs from the throat to the lips

Batch 8 confirmed that the letters keep one internal order but did not say what the order is. Candidates:

- Place of articulation from the throat outward, in Sibawayh's order: alif, ha, 'ayn, hard ha, qaf, kaf, ya, lam, ra, nun, emphatic ta, sad, sin, mim (restricted to the 14 letters).
- The modern alphabetical order.
- The old abjad order.
- Frequency in the Quran, most frequent first.

Statistic for each: the share of observed "x before y" letter pairs that agree with the candidate order. Null: 200,000 random rankings of the 14 letters, seed 20261141; two-sided (an order could also run backwards).

Prediction: articulation does best and beats chance; the two alphabetical orders do not.

## How results will be read

- M1 positive: the lettered suras are marked by talk of scripture and writing beyond their openings, which is what the theory expects and what a theory of pure labels or scribal marks does not.
- M3 positive for articulation: the order is the order in which the mouth produces the sounds, a spoken ordering and not a written one.
- All three failing would count against the theory.

## Limits stated in advance

- M1 is correlational. Suras that talk about the Book could have been given letters, or lettered suras could share a period in which the Book was a frequent theme.
- The lexicon is my choice. It was fixed before looking at how the words are spread, and a narrower version is run alongside.
- M3 compares four candidate orders on about two dozen letter pairs; that is a small number, and four candidates means a modest p-value is weak evidence.
- None of this recovers what the letters were intended to mean.
