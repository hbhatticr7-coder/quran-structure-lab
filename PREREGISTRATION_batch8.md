# Pre-registration, batch 8: a tournament of theories about the disconnected letters

Written 2026-11-14, after batch 7 and before any of the tests below were coded or run.
The SHA-256 of this file is recorded in `results/batch8.json`. Internal pre-registration only.

## Aim

Batch 7 tested two theories (families: failed; letter frequency: only qaf in sura 50). This batch puts five more theories, and one lead from batch 7, through tests whose rules are fixed here.

The 14 letters: alif, lam, mim, sad, ra, kaf, ha (soft), ya, 'ayn, ta (emphatic), sin, ha (hard), qaf, nun.
The 14 distinct openings: ALM, ALMS, ALR, ALMR, KHY'S, TH, TSM, TS, YS, S, HM, 'SQ, Q, N.

## My prediction, recorded before running

A (rhyme), B (letterforms) and C (fixed order) will pass. D (sound classes) will pass, since al-Zamakhshari described it from the text. E (number 19) will fail. F (lettered suras as a class, in rhyme) uncertain.

## A. The letters rhyme with their sura

- Each opening is recited by letter-names. The ending of the last name gives a rhyme key from the batch 6 extractor: mim, sin, nun end in long vowel + consonant; sad and qaf in long a + consonant; ha and ra in long a.
- For each lettered sura, match = the share of its other verses whose rhyme family equals the opening's. Verses that consist only of letters are left out of the sura's profile.
- Statistic: mean match over the 29 suras (sura 42 uses its verse-1 letters). Null: the 29 endings shuffled among the 29 suras, 100,000 draws, seed 20261126, one-sided.
- Secondary: the 19 suras where the letters form a verse on their own, where rhyme is actually at stake; and exact rhyme key in place of family.

## B. The letters sample the shapes of the script

- Early Arabic writing had no dots, so several letters shared one shape. Grouping the 28 letters by isolated shape gives 18 groups: alif; ba-ta-tha; jim-ha-kha; dal-dhal; ra-zay; sin-shin; sad-dad; ta-za; 'ayn-ghayn; fa; qaf; kaf; lam; mim; nun; ha; waw; ya.
- Statistic: the number of shape groups the 14 letters cover. Null: all 40,116,600 ways of choosing 14 letters from 28, computed exactly. One-sided (as many groups or more).
- Secondary: a coarser grouping of 15 that merges fa with qaf, and nun and ya with the ba group (their shapes inside a word); and, for the groups with more than one letter, whether the letter present is the one written without dots today.

## C. The letters keep one internal order

- From every multi-letter opening, take all "x comes before y" relations. Statistic: whether a single ranking of the letters satisfies all of them (no cycle).
- Null: the letters of each of the 11 distinct multi-letter openings arranged at random, independently; 2,000,000 draws, seed 20261127. p = share of random arrangements that are also consistent.
- Proposed by Massey (Arabica, 1996); this is a re-test.

## D. The letters balance the classes of sounds

- Five classical classes (Sibawayh's, as listed by al-Zamakhshari): voiceless (10 letters), stops (8), emphatic (4), elevated (7), qalqala (5). Alif stands for hamza in these lists.
- Statistic: sum over the five classes of |letters present - half the class size|. Smaller is more balanced. Null: random 14 of 28, 2,000,000 draws, seed 20261128; p = share with imbalance as small or smaller.

## E. The letter counts are multiples of 19

- For each of the 78 sura-letter cases: the count of the letter in its sura, opening letters included, basmala excluded, written-skeleton rule of batch 7.
- Statistic: how many of the 78 are multiples of 19. Null: binomial with chance 1 in 19 (about 4 expected). One-sided.
- Secondary: the strict counting rule; basmala included; the 29 per-sura totals of all opening letters together; and five of Khalifa's headline claims checked directly (qaf in 50, qaf in 42, nun in 68, sad across 7 + 19 + 38, ha + mim across 40 to 46).

## F. Lettered suras form one class (lead from batch 7)

Batch 7 found, after the fact, that lettered suras resemble each other in vocabulary. Two checks:

- **Fresh feature:** rhyme similarity with BOTH (both suras lettered) as the variable tested and the batch 7 controls (neighbours, mushaf distance, Egyptian revelation order, period, length, verse length, sura baselines). MRQAP, 10,000 permutations, seed 20261129, one-sided.
- **Is it the opening formula?** A sura is a "Book-opener" if its first three verses contain a word from the roots k-t-b, q-r-', or n-z-l. The batch 7 vocabulary test of BOTH is repeated with "both are Book-openers" added as a control.

## Reading the results

- Each test passes at p < 0.05. With six theories in play, p < 0.008 is the stricter mark.
- B, C and D are patterns that scholars noticed by looking at the letters. A probability computed afterwards overstates how surprising they are, because nobody records the patterns that were looked for and not found. They are reported with that warning.
- Passing shows a regularity in how the letters behave. It does not show what they were meant to convey.

## Limits stated in advance

- Fourteen letters and fourteen distinct openings. Small numbers throughout.
- B and D depend on how letters are grouped. The groupings are fixed above, with one alternative for B.
- A depends on the rhyme extractor and on treating letter-names as rhyme words.
- E follows this project's counting rule; other rules give other counts.
