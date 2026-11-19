# Census of choice sites

Written by `project/tools/census.mjs` (census version 4). Do not edit by hand.

A *problem* is one kind of choice (one phrase frame, one set of synonyms). A *choice* is one place in the text where it is made.

**Problems and their options are defined from the build suras only.** The test suras play no part in deciding what counts as a problem. Where a test sura uses a word that the build suras never show in that slot, the place is counted in the last column and is not scored. **The vault suras are not loaded at all**, so this page has no numbers for them.

| Type | What it is | Problems | Choices in build suras | In test suras | Test: word not among the options |
|---|---|---|---|---|---|
| frame | A word slot with the same three words before and after it, filled by different words in different places | 233 | 725 | 140 | 29 |
| synonym | An occurrence of a word from 9 listed sets of near-synonyms | 9 | 795 | 433 | 0 |
| ending | A verse closed by a pair of words: given the first, which word closes it | 15 | 338 | 120 | 95 |
| order | Two nouns joined by "and" that occur in both orders | 6 | 81 | 15 | 0 |
| **all** | | 263 | 1,939 | 708 | 124 |

The split: 58 build suras (37,571 words), 28 test suras (20,878), 28 vault suras (18,980).

The files in `project/sites/` list every problem with its occurrences in the build suras only. They are safe to open and read.

## Not yet turned into problems

- **Near-identical verses.** Within the build suras, 206 pairs of verses share at least 70% of their words in order. 122 are word-for-word identical; 43 differ by a swapped word; 30 by words added or left out; 22 in a longer stretch. (A pair can fall in more than one group.) Added and omitted words are not yet covered.
- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.
- **What each telling of a story includes.** See batch 16.

## Versions

- **Version 1** defined problems from the whole text. A phrase frame counted only if its word varied somewhere, so a frame seen once in the build suras and once in the test suras was certain to differ there, and the baseline was certain to be wrong on it. That made any rule look better against the baseline than it was.
- **Version 2** defined phrase, ending and order problems from the build suras alone. Codex then found (`project/CENSUS_V2_AUDIT.md`) that the near-synonym options were still picked out by scanning the whole text, that the root of an option word was looked up in the whole text, and that nothing stopped a rule from reading a test or vault sura.
- **Version 3** closes those. Near-synonym options are explicit lists of dictionary forms compiled from the build suras (`project/synonyms.json`). Roots are looked up in the defining suras. A run loads only the suras it may see, and a rule may read only its own sura and the suras it learns from. Measured effect of the change on the test suras: 4 places (3 in "fear", 1 in "rain") that version 2 counted are no longer occurrences, because their dictionary form never occurs in the build suras.
- **Version 4** changed no problem. It changed the scoring: for near-synonym places the baseline is now the commonest option among build places of the same grammatical form (a verb's tense, a noun's definiteness), and a rule is told that form and nothing more about the hidden word. Codex's review (`project/CENSUS_V3_REVIEW.md`) showed why: rule R003 had passed by reading the tense, which a baseline that reads the tense does equally well. Version 4 also skips the lines of excluded suras unparsed and orders the site files by build counts. Codex then reviewed version 4 (`project/METHOD_V4_REVIEW.md`) and it was repaired on 2026-11-19, before any rule had been tested under it: the code a run loads is now recorded by Node's own module loader instead of by reading import lines; a rule is told the form only where the baseline uses it; and a challenge counts only for the test it names.
- Versions 1 and 2 loaded the vault suras, counted their choices and wrote them into `project/sites/`. No rule was ever scored on them, but both models could have opened those files. The vault is therefore sealed from version 3 on, not untouched from the start.
