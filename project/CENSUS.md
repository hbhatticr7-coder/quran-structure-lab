# Census of choice sites

Written by `project/tools/census.mjs` (census version 2). Do not edit by hand.

A *problem* is one kind of choice (one phrase frame, one set of synonyms). A *choice* is one place in the text where it is made.

**Problems and their options are defined from the build suras only.** The test and vault suras play no part in deciding what counts as a problem. Where a test or vault sura uses a word that the build suras never show in that slot, the place is counted in the last two columns and is not scored.

| Type | What it is | Problems | Choices in build suras | In test suras | In vault suras | Test: word not among the options | Vault: same |
|---|---|---|---|---|---|---|---|
| frame | A word slot with the same three words before and after it, filled by different words in different places | 233 | 725 | 140 | 95 | 29 | 60 |
| synonym | An occurrence of a word from 9 listed sets of near-synonyms | 9 | 795 | 437 | 427 | 0 | 0 |
| ending | A verse closed by a pair of words: given the first, which word closes it | 15 | 338 | 120 | 111 | 95 | 82 |
| order | Two nouns joined by "and" that occur in both orders | 6 | 81 | 15 | 28 | 0 | 0 |
| **all** | | 263 | 1,939 | 712 | 661 | 124 | 142 |

The split: 58 build suras (37,571 words), 28 test suras (20,878), 28 vault suras (18,980).

## Not yet turned into problems

- **Near-identical verses.** 886 pairs of verses share at least 70% of their words in order. 670 are word-for-word identical; 102 differ by a swapped word; 104 by words added or left out; 59 in a longer stretch. (A pair can fall in more than one group.) Added and omitted words are not yet covered.
- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.
- **What each telling of a story includes.** See batch 16.

## Why version 2

Version 1 defined problems from the whole text. A phrase frame counted only if its word varied somewhere, so a frame seen once in the build suras and once in the test suras was certain to differ there, and the baseline was certain to be wrong on it. That made any rule look better against the baseline than it was. Version 2 removes this by defining problems from the build suras alone.
